from dataclasses import dataclass, field


@dataclass
class MoveError:
    ply: int
    san: str
    reason: str


@dataclass
class ValidationReport:
    legal: bool
    legal_through_ply: int
    errors: list[MoveError] = field(default_factory=list)
    final_fen: str | None = None


def validate_move_sequence(moves: list[str]) -> ValidationReport:
    import chess

    board = chess.Board()
    errors: list[MoveError] = []

    for ply, san in enumerate(moves, start=1):
        try:
            board.push_san(san)
        except ValueError as exc:
            errors.append(MoveError(ply=ply, san=san, reason=str(exc)))
            break

    legal_through = ply - 1 if errors else len(moves)
    return ValidationReport(
        legal=len(errors) == 0,
        legal_through_ply=legal_through,
        errors=errors,
        final_fen=board.fen() if legal_through > 0 or not moves else chess.STARTING_FEN,
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
