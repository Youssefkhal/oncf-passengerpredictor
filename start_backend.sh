#!/bin/bash

# Script de démarrage du backend ONCF
echo "🚀 Démarrage du backend ONCF..."

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé. Veuillez l'installer depuis https://python.org/"
    exit 1
fi

# Vérifier si pip est installé
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 n'est pas installé. Veuillez l'installer avec Python"
    exit 1
fi

# Aller dans le répertoire backend
cd backend

# Vérifier si requirements.txt existe
if [ ! -f "requirements.txt" ]; then
    echo "❌ Fichier requirements.txt non trouvé"
    exit 1
fi

# Installer les dépendances si nécessaire
echo "📦 Vérification des dépendances..."
pip3 install -r requirements.txt

# Démarrer le serveur
echo "🌐 Démarrage du serveur FastAPI..."
echo "📍 L'API sera accessible sur: http://localhost:8000"
echo "📚 Documentation API: http://localhost:8000/docs"
echo "🔗 Le frontend peut se connecter sur: http://localhost:12001"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload 