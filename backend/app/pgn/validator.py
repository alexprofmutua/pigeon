from dataclasses import dataclass, field


@dataclass
class MoveError:
    ply: int
    san: str
    reason: str
    alternatives: list[str] = field(default_factory=list)


@dataclass
class ValidationReport:
    legal: bool
    legal_through_ply: int
    errors: list[MoveError] = field(default_factory=list)
    final_fen: str | None = None


def _levenshtein(a: str, b: str) -> int:
    a, b = a.lower(), b.lower()
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[m][n]


def _ranked_alternatives(board, raw_san: str, limit: int = 3) -> list[str]:
    """Rank every legal move at this position by edit-distance similarity to
    what OCR/handwriting produced, so the closest plausible intended move is
    surfaced first."""
    candidates = [board.san(m) for m in board.legal_moves]
    ranked = sorted(candidates, key=lambda san: _levenshtein(raw_san, san))
    return ranked[:limit]


def validate_move_sequence(moves: list[str]) -> ValidationReport:
    """Validate a full move list against real chess rules.

    Key difference from a naive implementation: a single bad move does NOT
    stop validation of the rest of the game. The board position only
    advances on moves that parse and are legal; an illegal/misread move is
    recorded with ranked alternatives (the closest legal moves at that same
    position) and the board holds position so every remaining move still
    gets checked, instead of every later ply being marked invalid just
    because one earlier move failed.
    """
    import chess

    board = chess.Board()
    errors: list[MoveError] = []
    first_error_ply: int | None = None

    for ply, san in enumerate(moves, start=1):
        try:
            board.push_san(san)
        except ValueError as exc:
            if first_error_ply is None:
                first_error_ply = ply
            errors.append(
                MoveError(
                    ply=ply,
                    san=san,
                    reason=str(exc),
                    alternatives=_ranked_alternatives(board, san),
                )
            )
            # Do not advance the board -- keep checking subsequent plies
            # against the same last-known-good position so one bad move
            # doesn't cascade into flagging an otherwise-correct game.

    legal_through_ply = (first_error_ply - 1) if first_error_ply is not None else len(moves)

    return ValidationReport(
        legal=len(errors) == 0,
        legal_through_ply=legal_through_ply,
        errors=errors,
        final_fen=board.fen(),
    )


def build_pgn(
    *,
    white: str,
    black: str,
    moves: list[str],
    result: str = "*",
    event: str | None = None,
    site: str | None = None,
    date: str | None = None,
    round_num: int | None = None,
) -> str:
    import chess
    import chess.pgn

    game = chess.pgn.Game()
    node = game

    headers = {
        "White": white,
        "Black": black,
        "Result": result,
    }
    if event:
        headers["Event"] = event
    if site:
        headers["Site"] = site
    if date:
        headers["Date"] = date
    if round_num is not None:
        headers["Round"] = str(round_num)

    for key, value in headers.items():
        game.headers[key] = value

    board = chess.Board()
    for san in moves:
        move = board.parse_san(san)
        node = node.add_variation(move)
        board.push(move)

    game.headers["Result"] = result

    exporter = chess.pgn.StringExporter(headers=True, variations=False, columns=80)
    return game.accept(exporter)
