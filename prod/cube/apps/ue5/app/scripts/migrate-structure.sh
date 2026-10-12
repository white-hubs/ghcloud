#!/usr/bin/env bash
# Stage A: physical directory migration for apps/ue5/app
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/src"
cd "$SRC"

echo "==> Creating target directories..."
mkdir -p shared/panel equipment views/login views/visualization styles cards/_register

echo "==> config: move config-loader"
if [ -f pages/config-loader.ts ]; then
  mv pages/config-loader.ts config/config-loader.ts
fi

echo "==> model-sdk, event, widgets"
[ -d pages/model-sdk ] && mv pages/model-sdk ./
[ -d pages/event ] && mv pages/event ./
[ -d pages/widget ] && mv pages/widget widgets

echo "==> stores: merge pages/state + piniaStore"
if [ -d pages/state ]; then
  for f in pages/state/*; do
    [ -e "$f" ] && mv "$f" stores/ 2>/dev/null || true
  done
  rmdir pages/state 2>/dev/null || true
fi
if [ -d piniaStore ]; then
  for f in piniaStore/*; do
    [ -e "$f" ] && mv "$f" stores/ 2>/dev/null || true
  done
  rmdir piniaStore 2>/dev/null || true
fi

echo "==> views/visualization: move pages/index.tsx"
if [ -f pages/index.tsx ]; then
  mv pages/index.tsx views/visualization/index.tsx
fi

echo "==> shared/panel: move businessPanel/public"
if [ -d components/businessPanel/public ]; then
  mv components/businessPanel/public/* shared/panel/ 2>/dev/null || true
  rmdir components/businessPanel/public 2>/dev/null || true
fi

echo "==> shared: move basic"
if [ -d components/basic ]; then
  mkdir -p shared/basic
  mv components/basic/* shared/basic/ 2>/dev/null || true
  rmdir components/basic 2>/dev/null || true
fi

echo "==> equipment: merge equipment* and alarm*"
for d in equipmentdetails equipmentPanel alarmdetails alarmPanel alarm-chart-components modal-table; do
  if [ -d "components/$d" ]; then
    mkdir -p "equipment/$d"
    mv "components/$d"/* "equipment/$d/" 2>/dev/null || true
    rmdir "components/$d" 2>/dev/null || true
  fi
done

echo "==> cards: move businessPanel"
if [ -d components/businessPanel ]; then
  # move contents except already moved public
  for item in components/businessPanel/*; do
    base=$(basename "$item")
    [ "$base" = "public" ] && continue
    mv "$item" cards/ 2>/dev/null || true
  done
  rmdir components/businessPanel 2>/dev/null || true
fi

echo "==> hooks from components"
if [ -d components/hooks ]; then
  mv components/hooks/* hooks/ 2>/dev/null || true
  rmdir components/hooks 2>/dev/null || true
fi

echo "==> remaining components/index.ts -> shared"
if [ -f components/index.ts ]; then
  mv components/index.ts shared/component-register.ts 2>/dev/null || true
fi
rmdir components 2>/dev/null || true

echo "==> login -> views/login"
if [ -d login ]; then
  mv login/* views/login/ 2>/dev/null || true
  rmdir login 2>/dev/null || true
fi

echo "==> styles merge"
if [ -d style ]; then
  mv style/* styles/ 2>/dev/null || true
  rmdir style 2>/dev/null || true
fi
[ -f style.css ] && mv style.css styles/global.css 2>/dev/null || true

echo "==> card-register -> cards/_register"
if [ -f cards/base-panel-render/card-register.ts ]; then
  mv cards/base-panel-render/card-register.ts cards/_register/card-register.ts
fi

echo "==> cleanup empty pages"
rmdir pages/components pages/utils 2>/dev/null || true
rmdir pages 2>/dev/null || true

echo "==> remove legacy view shells"
rm -rf views-2d views-3d views-three views-gis 2>/dev/null || true

echo "==> remove template dead code"
rm -rf views/showcase views/demo-home views/demo-detail views/demo-edit views/demo-list views/module mocks mock mockProdServer.ts 2>/dev/null || true
rm -f App.vue 2>/dev/null || true

echo "==> Structure migration complete."
