#!/bin/bash

echo "🔧 Compilando el proyecto..."
npm run build

echo "🚀 Cambiando a rama gh-pages..."
git checkout gh-pages

echo "📂 Copiando archivos de dist/ a la raíz..."
cp -r dist/* .

echo "📦 Haciendo commit y push a gh-pages..."
git add .
git commit -m "Auto deploy"
git push origin gh-pages

echo "🔄 Volviendo a rama main..."
git checkout main

echo "✅ Deploy completado con éxito."
