#!/bin/bash
set -e

# 🗭️ Verificar si estamos dentro de un repositorio Git
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "❌ ERROR: Este script debe ejecutarse dentro de un repositorio Git."
  exit 1
fi

# 🛠️ Compilar el proyecto
echo "🔧 Compilando el proyecto..."
npm run build || { echo "❌ Falló la compilación"; exit 1; }

# 📁 Verificar carpeta dist/
if [ ! -d "dist" ]; then
  echo "❌ ERROR: No existe la carpeta dist/. Ejecuta 'npm run build' antes del deploy."
  exit 1
fi

# ⚠️ Advertir si dist/ está vacía
if [ -z "$(ls -A dist)" ]; then
  echo "⚠️ ADVERTENCIA: La carpeta dist/ está vacía. El deploy no copiará nada."
fi

# 🪄 Crear rama temporal de trabajo
echo "🔀 Creando rama temporal 'deploy-temp'..."
git checkout -b deploy-temp

# 🧹 Limpiar contenido del repositorio
git rm -rf . > /dev/null 2>&1

# 📂 Copiar archivos desde dist
cp -r dist/* ./

# 📤 Commit y push a gh-pages
git add .
git commit -m "🚀 Deploy automático desde dist"
git push -f origin deploy-temp:gh-pages

# 🔄 Volver a la rama main
echo "🔄 Volviendo a la rama main..."
git checkout main

# 🗑️ Borrar rama temporal
echo "🗑️ Borrando rama 'deploy-temp'..."
git branch -D deploy-temp

echo "✅ Deploy completado con éxito."
