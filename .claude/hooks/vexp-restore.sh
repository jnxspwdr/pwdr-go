#!/bin/bash
# vexp-restore: context lifecycle restore on SessionStart (compact/resume). Fails open.
VEXP_BIN="/home/jnx/.bun/install/global/node_modules/@vexp/core-linux-x64/bin/vexp-core"
[ -x "$VEXP_BIN" ] || exit 0
"$VEXP_BIN" session-context 2>/dev/null
exit 0
