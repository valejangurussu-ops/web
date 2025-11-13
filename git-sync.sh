#!/bin/bash

set -e

echo "🔀 Indo para branch main..."
git checkout main

echo "🔄 Dando pull no origin/main..."
git pull origin main

echo "🔀 Indo para branch deploy..."
git checkout deploy

echo "🔁 Merge squash de main → deploy (priorizando main)..."
git merge --squash main -X theirs --allow-unrelated-histories || true

echo "🧹 Forçando resolução automática de conflitos (aceitando main)..."
git checkout --theirs .

echo "💾 Adicionando tudo..."
git add .

echo "📝 Criando commit squash..."
git commit -m "Atualiza deploy com mudanças da main (prioriza main)"

echo "📤 Enviando para deploy..."
git push origin deploy

echo "✅ Deploy atualizado priorizando main!"
