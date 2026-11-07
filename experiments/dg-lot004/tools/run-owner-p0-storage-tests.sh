#!/usr/bin/env bash
# 04 ARCHIVES P0_STORAGE_SUPPORT_001 — reproducible owner suite.
# Do not mark the nine tests executed if the ZIP isn't actually present.
set -euo pipefail
INPUT="${1:-}"
PROJECT="experiments/dg-lot004"
EXPECTED_ZIP="38b1e055a94562aa8a6e35073a0997fcb88583b21582dc58d8eeb3cf2b88c2d1"
EXPECTED_TEST="d89dea819a387dc9fdc5b61dfdaf62bc7e17aed3d930576f57cd2da4db3259b5"
TEST_PATH="$PROJECT/tests/storage/P0_STORAGE_SUPPORT_REAL.test.mjs"
if [[ -z "$INPUT" || ! -f "$INPUT" ]]; then
 echo "P0_STORAGE_OWNER_NINE_NOT_EXECUTED: provide the raw ZIP as first argument (Library raw materialization was denied)" >&2
 exit 2
fi
echo "$EXPECTED_ZIP  $INPUT" | sha256sum --check --status || {
 echo "P0_STORAGE_OWNER_ZIP_SHA_MISMATCH" >&2; exit 2;
}
mkdir -p "$(dirname "$TEST_PATH")"
# Require the exact internal file name; never use unzip -o on arbitrary paths.
ENTRY="$(unzip -Z1 "$INPUT" | grep -E '(^|/)P0_STORAGE_SUPPORT_REAL\.test\.mjs$' | head -n 1)"
if [[ -z "$ENTRY" ]]; then echo "P0_STORAGE_OWNER_TEST_NOT_FOUND" >&2; exit 2; fi
unzip -p "$INPUT" "$ENTRY" > "$TEST_PATH"
echo "$EXPECTED_TEST  $TEST_PATH" | sha256sum --check --status || {
 echo "P0_STORAGE_OWNER_TEST_SHA_MISMATCH" >&2; rm -f "$TEST_PATH"; exit 2;
}
echo "P0_STORAGE_OWNER_SHA_VERIFIED" 
node --test "$TEST_PATH"
