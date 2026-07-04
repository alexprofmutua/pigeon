/** Heuristics to catch bad scoresheet photos before OCR. */

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

function regionVariance(ctx, x, y, w, h) {
  const data = ctx.getImageData(x, y, w, h).data
  let sum = 0
  let sumSq = 0
  const n = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    sum += gray
    sumSq += gray * gray
  }
  const mean = sum / n
  return sumSq / n - mean * mean
}

/**
 * @returns {{ ok: boolean, issues: string[] }}
 */
export async function checkScoresheetPhoto(file) {
  const img = await loadImageFromFile(file)
  const issues = []

  if (img.width > img.height * 1.05) {
    issues.push('Photo is sideways or too wide. Hold your phone upright (portrait) and fill the frame with the sheet.')
  }

  if (Math.min(img.width, img.height) < 800) {
    issues.push('Image is low resolution. Move closer so the scoresheet fills most of the photo.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const h = img.height
  const w = img.width

  const topVar = regionVariance(ctx, 0, 0, w, Math.floor(h * 0.55))
  const bottomVar = regionVariance(ctx, 0, Math.floor(h * 0.45), w, Math.floor(h * 0.55))

  // Large empty desk/table area above the sheet
  if (topVar < 180 && bottomVar > topVar * 1.8) {
    issues.push('The scoresheet looks cut off — most of the photo is empty table. Include the full sheet from header to move grid.')
  }

  return { ok: issues.length === 0, issues }
}

export function formatPhotoIssues(issues) {
  return issues.map((i) => `• ${i}`).join('\n')
}
