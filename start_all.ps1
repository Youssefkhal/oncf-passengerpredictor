# Script de démarrage complet ONCF (Backend + Frontend)
Write-Host "🚀 Démarrage complet de l'application ONCF..." -ForegroundColor Green
Write-Host ""

# Vérifier les prérequis
Write-Host "🔍 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas installé" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow

# Installer les dépendances backend
Write-Host "🔧 Installation des dépendances Python..." -ForegroundColor Cyan
Set-Location backend
pip install -r requirements.txt

# Installer les dépendances frontend
Write-Host "🔧 Installation des dépendances Node.js..." -ForegroundColor Cyan
Set-Location ../frontend
npm install

# Retourner au répertoire racine
Set-Location ..

Write-Host ""
Write-Host "🌐 Démarrage des serveurs..." -ForegroundColor Green
Write-Host ""

# Démarrer le backend dans une nouvelle fenêtre
Write-Host "🚀 Démarrage du backend sur http://localhost:8000" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

# Attendre un peu pour que le backend démarre
Start-Sleep -Seconds 3

# Démarrer le frontend dans une nouvelle fenêtre
Write-Host "🚀 Démarrage du frontend sur http://localhost:12001" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host ""
Write-Host "✅ Application ONCF démarrée avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs d'accès:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend: http://localhost:12001" -ForegroundColor Cyan
Write-Host "   🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   📚 Documentation API: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Les deux serveurs sont maintenant en cours d'exécution dans des fenêtres séparées."
Write-Host "   Vous pouvez fermer cette fenêtre."
Write-Host "" 