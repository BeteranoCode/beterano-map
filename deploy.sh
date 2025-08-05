#!/bin/bash
set -e

# 📍 Verificar si estamos dentro de un repositorio Git
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "❌ ERROR: Este script debe ejecutarse dentro de un repositorio Git."
  exit 1
fi

# 📍 Verificar si hay cambios sin guardar
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️ Tienes cambios sin guardar. Por favor haz commit o stash antes de hacer deploy."
  exit 1
fi

# 📦 Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 node_modules no encontrado. Ejecutando npm install..."
  npm install || {
    echo "⚠️ npm install falló. Intentando limpieza profunda..."
    rm -rf node_modules package-lock.json
    npm install || { echo "❌ npm install falló incluso tras limpiar. Revisa manualmente."; exit 1; }
  }
fi

# ✅ Verificar si vite está disponible
if ! npx --no vite --version > /dev/null 2>&1; then
  echo "❌ Vite no está instalado o hay un error en node_modules. Intentando reparar..."
  rm -rf node_modules package-lock.json
  npm install || { echo "❌ npm install falló. Revisa tu package.json"; exit 1; }
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

# 🔄 Borrar rama 'deploy-temp' si existe
if git show-ref --verify --quiet refs/heads/deploy-temp; then
  echo "🧹 Borrando rama existente 'deploy-temp'..."
  git branch -D deploy-temp
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
