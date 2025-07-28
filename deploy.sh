#!/bin/bash

set -e

# 🛡️ Verificar si estamos dentro de un repositorio Git
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "❌ ERROR: Este script debe ejecutarse dentro de un repositorio Git."
  exit 1
fi

# 🛡️ Obtener la rama actual
current_branch=$(git rev-parse --abbrev-ref HEAD)

# 🛡️ Prevenir ejecución directa desde 'main'
if [ "$current_branch" = "main" ]; then
  echo "⚠️  Estás en la rama 'main'."
  echo "🔀 Cambiando temporalmente a rama 'deploy-temp' para ejecutar el deploy..."

  # Crear y moverse a una rama temporal si no existe
  if git show-ref --quiet refs/heads/deploy-temp; then
    git checkout deploy-temp
  else
    git checkout -b deploy-temp
  fi
fi

# 🛠️ Compilar el proyecto
echo "🔧 Compilando el proyecto..."
npm run build || { echo "❌ Falló la compilación"; exit 1; }

# 🚀 Cambiar a gh-pages (crear si no existe)
echo "🚀 Verificando si existe la rama gh-pages..."
if git show-ref --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  git checkout --orphan gh-pages
fi

# 🧹 Limpiar gh-pages
echo "🧹 Limpiando rama gh-pages..."
git rm -rf . > /dev/null 2>&1

# 📁 Verificar carpeta dist/
if [ ! -d "dist" ]; then
  echo "❌ ERROR: No existe la carpeta dist/. Ejecuta 'npm run build' antes del deploy."
  exit 1
fi

# ⚠️ Advertir si dist/ está vacía
if [ -z "$(ls -A dist)" ]; then
  echo "⚠️ ADVERTENCIA: La carpeta dist/ está vacía. El deploy no copiará nada."
fi

# 📦 Copiar dist/ (excluyendo data/)
echo "📂 Copiando archivos generados de dist/ (sin data/)..."
rsync -av --exclude='data/' dist/ . > /dev/null

# 📤 Commit y push
echo "📦 Haciendo commit y push a gh-pages..."
git add .
git commit -m "🚀 Deploy automático desde dist"
git push origin gh-pages --force

# 🔎 Revisar archivos data/
echo "🔍 Verificando si hay archivos data/ públicos en gh-pages..."
if find . -type f -path "*data/*" | grep .; then
  echo "⚠️  CUIDADO: ¡Hay archivos en la carpeta data/ que se han publicado!"
else
  echo "✅ Ningún archivo data/ fue publicado"
fi

# 🔄 Volver a la rama main
echo "🔄 Volviendo a la rama main..."
git checkout main

# 🧹 Borrar rama temporal si se creó
if git show-ref --quiet refs/heads/deploy-temp; then
  echo "🗑️ Eliminando rama temporal 'deploy-temp'..."
  git branch -D deploy-temp
fi

echo "✅ Deploy completado con éxito."
