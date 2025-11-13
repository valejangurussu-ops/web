#!/bin/bash
set -eu

echo "🔀 Checkout main..."
git checkout main

echo "🔄 Pull origin/main..."
git pull origin main

echo "🔀 Checkout (ou criar) branch deploy..."
if git show-ref --verify --quiet refs/heads/deploy; then
  git checkout deploy
else
  git checkout -b deploy
fi

echo "🧹 Limpando arquivos TRACKED em deploy..."
git rm -rf . || true

echo "🧽 Limpando arquivos não rastreados..."
git clean -fdx || true

echo "📥 Copiando conteúdo de main para deploy..."
git checkout main -- .

echo "➕ Adicionando tudo..."
git add -A

if git diff --cached --quiet; then
  echo "ℹ️ Nenhuma mudança detectada. Enviando push mesmo assim..."
  git push deploy HEAD:main --force-with-lease
  echo "✅ Deploy sincronizado (nenhuma alteração)."
  exit 0
fi

echo "✏️ Criando commit único..."
git commit -m "Deploy: single snapshot from main"

echo "📤 Enviando push forçado para deploy:main..."
git push deploy HEAD:main --force-with-lease

echo "✅ Deploy atualizado com único commit."
