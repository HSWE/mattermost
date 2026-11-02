#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir/server"

make build-client build-linux-amd64 BUILD_ENTERPRISE=false
make package-linux-amd64 BUILD_ENTERPRISE=false
