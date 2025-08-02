#!/bin/bash

# Script de démarrage du frontend ONCF
echo "🚀 Démarrage du frontend ONCF..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer avec Node.js"
    exit 1
fi

# Aller dans le répertoire frontend
cd frontend

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer le serveur de développement
echo "🌐 Démarrage du serveur de développement..."
echo "📍 Le frontend sera accessible sur: http://localhost:12001"
echo "🔗 Assurez-vous que le backend est démarré sur http://localhost:8000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

npm run dev 