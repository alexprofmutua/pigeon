import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { reviewToLocalGame, validateMoves } from '../utils/chessMoves'

const PROFILE_KEY = 'pigeon_profile'

const defaultProfile = {
  name: '',
  fide_id: '',
  fide_rating: '',
  chesscom: '',
  chesscom_rating: '',
  lichess: '',
  lichess_rating: '',
}

const PigeonContext = createContext(null)

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : { ...defaultProfile }
  } catch {
    return { ...defaultProfile }
  }
}

export function PigeonProvider({ children }) {
  const [tab, setTab] = useState('scan')
  const [toast, setToast] = useState(null)
  const [pendingImages, setPendingImages] = useState([])
  const [reviewGames, setReviewGames] = useState([])
  const [profile, setProfile] = useState(loadProfile)
  const [backendOnline, setBackendOnline] = useState(null)
  const [archive, setArchive] = useState({ events: [], games: [], players: {} })
  const [activeEvent, setActiveEvent] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }, [])

  const checkBackend = useCallback(async () => {
    try {
      const res = await fetch('/health')
      setBackendOnline(res.ok)
    } catch {
      setBackendOnline(false)
    }
  }, [])

  useEffect(() => {
    checkBackend()
  }, [checkBackend])

  const pollReviewQueue = useCallback(async () => {
    if (backendOnline !== true) return
    try {
      const pending = await api.listGames({ game_status: 'needs_review' })
      const loaded = new Set(reviewGames.filter((g) => g.backendGameId).map((g) => g.backendGameId))
      const fresh = pending.filter((g) => !loaded.has(g.id))
      if (!fresh.length) return
      const added = []
      for (const g of fresh) {
        try {
          const review = await api.getReview(g.id)
          added.push(reviewToLocalGame(review))
        } catch {
          /* skip */
        }
      }
      if (added.length) {
        setReviewGames((prev) => [...prev, ...added])
        showToast(`${added.length} new scan${added.length === 1 ? '' : 's'} synced from backend`)
      }
    } catch {
      /* quiet */
    }
  }, [backendOnline, reviewGames, showToast])

  useEffect(() => {
    if (tab !== 'review') return undefined
    pollReviewQueue()
    const id = setInterval(pollReviewQueue, 7000)
    return () => clearInterval(id)
  }, [tab, pollReviewQueue])

  const loadArchive = useCallback(async () => {
    if (backendOnline !== true) return
    try {
      const [events, games, players] = await Promise.all([
        api.listEvents(),
        api.listGames(),
        api.listPlayers?.() ?? Promise.resolve([]),
      ])
      const playerMap = {}
      players.forEach((p) => {
        playerMap[p.id] = p
      })
      setArchive({ events, games, players: playerMap })
    } catch (err) {
      showToast(`Could not load archive: ${err.message}`)
    }
  }, [backendOnline, showToast])

  useEffect(() => {
    if ((tab === 'archive' || tab === 'dashboard') && backendOnline) {
      loadArchive()
    }
  }, [tab, backendOnline, loadArchive])

  const addPendingFiles = useCallback((files) => {
    const items = Array.from(files).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      dataUrl: URL.createObjectURL(file),
      status: 'pending',
      errorMsg: null,
    }))
    setPendingImages((prev) => [...prev, ...items])
  }, [])

  const clearPending = useCallback(() => {
    pendingImages.forEach((p) => URL.revokeObjectURL(p.dataUrl))
    setPendingImages([])
  }, [pendingImages])

  const processPendingImages = useCallback(async () => {
    let anyAdded = false
    for (let i = 0; i < pendingImages.length; i += 1) {
      const p = pendingImages[i]
      if (p.status !== 'pending') continue

      setPendingImages((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'processing' } : item))
      )

      try {
        const upload = await api.upload(p.file)
        const processed = await api.processUpload(upload.id)
        if (!processed.game_id) throw new Error('No moves were extracted from this image')
        const review = await api.getReview(processed.game_id)
        const local = reviewToLocalGame(review)
        const hasErrors = local.moves.some((m) => !m.legal)
        setPendingImages((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: hasErrors ? 'flagged' : 'ok' } : item
          )
        )
        setReviewGames((prev) => [...prev, local])
        anyAdded = true
      } catch (err) {
        setPendingImages((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'failed', errorMsg: err.message } : item
          )
        )
      }
    }
    if (anyAdded) setTab('review')
  }, [pendingImages])

  const updateReviewGame = useCallback((index, patch) => {
    setReviewGames((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)))
  }, [])

  const revalidateReviewGame = useCallback((index) => {
    setReviewGames((prev) =>
      prev.map((g, i) => {
        if (i !== index) return g
        const raws = g.moves.map((m) => m.raw)
        return { ...g, moves: validateMoves(raws) }
      })
    )
  }, [])

  const applySuggestion = useCallback(
    (gameIdx, plyIdx, newSan) => {
      setReviewGames((prev) =>
        prev.map((g, i) => {
          if (i !== gameIdx) return g
          const moves = g.moves.map((m, j) =>
            j === plyIdx ? { ...m, raw: newSan, san: newSan } : m
          )
          return { ...g, moves }
        })
      )
      setTimeout(() => revalidateReviewGame(gameIdx), 0)
    },
    [revalidateReviewGame]
  )

  const saveReviewGame = useCallback(
    async (index) => {
      const g = reviewGames[index]
      const remaining = g.moves.filter((m) => !m.legal).length
      if (remaining) {
        showToast(`${remaining} move(s) still flagged — fix before saving.`)
        return
      }
      if (!g.backendGameId) {
        showToast('This game is not linked to the backend yet.')
        return
      }
      const payload = {
        moves: g.moves.map((m, i) => ({ ply: i + 1, san: m.san })),
        result: g.result,
        white_name: g.white,
        black_name: g.black,
        event_name: g.tournament,
        board: g.board ? parseInt(g.board, 10) || null : null,
        section: g.section || null,
      }
      await api.updateMoves(g.backendGameId, payload)
      await api.verifyGame(g.backendGameId)
      setReviewGames((prev) => prev.filter((_, i) => i !== index))
      setArchive({ events: [], games: [], players: {} })
      showToast(`Verified and saved: ${g.tournament || 'Unsorted'}`)
    },
    [reviewGames, showToast]
  )

  const discardReviewGame = useCallback((index) => {
    setReviewGames((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const addReviewGame = useCallback((game) => {
    setReviewGames((prev) => [...prev, game])
    setTab('review')
  }, [])

  const saveProfile = useCallback(
    (next) => {
      setProfile(next)
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
      showToast('Profile saved')
    },
    [showToast]
  )

  const value = useMemo(
    () => ({
      tab,
      setTab,
      toast,
      showToast,
      pendingImages,
      addPendingFiles,
      clearPending,
      processPendingImages,
      reviewGames,
      updateReviewGame,
      revalidateReviewGame,
      applySuggestion,
      saveReviewGame,
      discardReviewGame,
      addReviewGame,
      profile,
      saveProfile,
      backendOnline,
      checkBackend,
      pollReviewQueue,
      archive,
      loadArchive,
      activeEvent,
      setActiveEvent,
    }),
    [
      tab,
      toast,
      showToast,
      pendingImages,
      addPendingFiles,
      clearPending,
      processPendingImages,
      reviewGames,
      updateReviewGame,
      revalidateReviewGame,
      applySuggestion,
      saveReviewGame,
      discardReviewGame,
      addReviewGame,
      profile,
      saveProfile,
      backendOnline,
      checkBackend,
      pollReviewQueue,
      archive,
      loadArchive,
      activeEvent,
    ]
  )

  return <PigeonContext.Provider value={value}>{children}</PigeonContext.Provider>
}

export function usePigeon() {
  const ctx = useContext(PigeonContext)
  if (!ctx) throw new Error('usePigeon must be used within PigeonProvider')
  return ctx
}
