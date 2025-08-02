# Script de démarrage du frontend ONCF pour Windows
Write-Host "🚀 Démarrage du frontend ONCF..." -ForegroundColor Green

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Vérifier si npm est installé
try {
    $npmVersion = npm --version
    Write-Host "✅ npm détecté: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas installé. Veuillez l'installer avec Node.js" -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire frontend
Set-Location frontend

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Démarrer le serveur de développement
Write-Host "🌐 Démarrage du serveur de développement..." -ForegroundColor Green
Write-Host "📍 Le frontend sera accessible sur: http://localhost:12001" -ForegroundColor Cyan
Write-Host "🔗 Assurez-vous que le backend est démarré sur http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

npm run dev 