#!/usr/bin/env bash
# Add Pigeon todo alias to your shell. Run once per machine:
#   ./scripts/setup-shell.sh

set -euo pipefail

PIGEON_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MARKER="# Pigeon weekly todos"
ZSHRC="${HOME}/.zshrc"

if [[ -f "$ZSHRC" ]] && grep -qF "$MARKER" "$ZSHRC"; then
  echo "Already configured in $ZSHRC"
  exit 0
fi

cat >> "$ZSHRC" <<EOF

${MARKER} — \`done\` is a zsh reserved word (for-loops), so we use \`pdone\`
pdone() {
  command ${PIGEON_ROOT}/scripts/done "\$@"
}
EOF

echo "Added pdone to $ZSHRC"
echo "Restart your terminal, then run:"
echo "  pdone who alex"
echo "  pdone git-init"
