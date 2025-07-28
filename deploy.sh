#!/bin/bash

set -e

# 🛡️ Protección: prevenir ejecución en rama main
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" = "main" ]; then
  echo "❌ ERROR: Estás en 'main'. Cancela el deploy o cambia de rama primero."
  exit 1
fi

echo "🔧 Compilando el proyecto..."
npm run build || { echo "❌ Falló la compilación"; exit 1; }

echo "🚀 Verificando si existe la rama gh-pages..."
if git show-ref --quiet refs/heads/gh-pages; then
  echo "✅ Rama gh-pages ya existe. Cambiando..."
  git checkout gh-pages
else
  echo "🆕 Rama gh-pages no existe. Creando..."
  git checkout --orphan gh-pages
fi

echo "🧹 Limpiando rama gh-pages..."
git rm -rf . > /dev/null 2>&1

# ❌ Verificar que la carpeta dist/ existe
if [ ! -d "dist" ]; then
  echo "❌ ERROR: No existe la carpeta dist/. Ejecuta 'npm run build' antes del deploy."
  exit 1
fi

# ⚠️ Advertencia si dist/ está vacía
if [ -z "$(ls -A dist)" ]; then
  echo "⚠️ ADVERTENCIA: La carpeta dist/ está vacía. El deploy no copiará nada."
fi

echo "📂 Copiando solo archivos generados de dist/ (sin data/)..."
rsync -av --exclude='data/' dist/ . > /dev/null

echo "📦 Haciendo commit y push a gh-pages..."
git add .
git commit -m "🚀 Deploy automático desde dist"
git push origin gh-pages --force

echo "🔍 Verificando si hay archivos data/ públicos en gh-pages..."
if find . -type f -path "*data/*" | grep .; then
  echo "⚠️  CUIDADO: ¡Hay archivos en la carpeta data/ que se han publicado!"
else
  echo "✅ Ningún archivo data/ fue publicado"
fi

echo "🔄 Volviendo a la rama main..."
git checkout main

echo "✅ Deploy completado con éxito."
