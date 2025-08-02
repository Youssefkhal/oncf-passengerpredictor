# Script de démarrage automatique pour l'application ONCF
Write-Host "🚀 DÉMARRAGE DE L'APPLICATION ONCF" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Vérifier si Python est installé
Write-Host "`n1️⃣ Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python non trouvé. Veuillez installer Python." -ForegroundColor Red
    exit 1
}

# Vérifier si Node.js est installé
Write-Host "`n2️⃣ Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé. Veuillez installer Node.js." -ForegroundColor Red
    exit 1
}

# Vérifier si npm est installé
Write-Host "`n3️⃣ Vérification de npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm détecté: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm non trouvé. Veuillez installer npm." -ForegroundColor Red
    exit 1
}

# Obtenir le répertoire du script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "`n📁 Répertoire du script: $scriptDir" -ForegroundColor Cyan

# Démarrer le backend
Write-Host "`n4️⃣ Démarrage du Backend (FastAPI)..." -ForegroundColor Yellow
$backendDir = Join-Path $scriptDir "backend"
if (Test-Path $backendDir) {
    Write-Host "📂 Dossier backend trouvé: $backendDir" -ForegroundColor Green
    
    # Installer les dépendances Python si nécessaire
    if (Test-Path (Join-Path $backendDir "requirements.txt")) {
        Write-Host "📦 Installation des dépendances Python..." -ForegroundColor Cyan
        Set-Location $backendDir
        pip install -r requirements.txt
    }
    
    # Démarrer le backend dans une nouvelle fenêtre
    Write-Host "🚀 Démarrage du backend sur http://localhost:8000" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
} else {
    Write-Host "❌ Dossier backend non trouvé: $backendDir" -ForegroundColor Red
    exit 1
}

# Attendre un peu pour que le backend démarre
Write-Host "⏳ Attente du démarrage du backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Démarrer le frontend
Write-Host "`n5️⃣ Démarrage du Frontend (React)..." -ForegroundColor Yellow
$frontendDir = Join-Path $scriptDir "frontend"
if (Test-Path $frontendDir) {
    Write-Host "📂 Dossier frontend trouvé: $frontendDir" -ForegroundColor Green
    
    # Installer les dépendances npm si nécessaire
    if (Test-Path (Join-Path $frontendDir "package.json")) {
        Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Cyan
        Set-Location $frontendDir
        npm install
    }
    
    # Démarrer le frontend dans une nouvelle fenêtre
    Write-Host "🚀 Démarrage du frontend sur http://localhost:12001" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"
} else {
    Write-Host "❌ Dossier frontend non trouvé: $frontendDir" -ForegroundColor Red
    exit 1
}

# Attendre un peu pour que le frontend démarre
Write-Host "⏳ Attente du démarrage du frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Afficher les URLs
Write-Host "`n🎉 APPLICATION DÉMARRÉE AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "`n🌐 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:12001" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "`n📋 Pages disponibles:" -ForegroundColor Cyan
Write-Host "   Dashboard:     http://localhost:12001/" -ForegroundColor White
Write-Host "   Upload/Train:  http://localhost:12001/upload-train" -ForegroundColor White
Write-Host "   Prédiction:    http://localhost:12001/predict" -ForegroundColor White
Write-Host "`n💡 Instructions:" -ForegroundColor Cyan
Write-Host "   1. Ouvrez http://localhost:12001 dans votre navigateur" -ForegroundColor White
Write-Host "   2. Les deux serveurs sont maintenant en cours d'exécution" -ForegroundColor White
Write-Host "   3. Fermez les fenêtres PowerShell pour arrêter les serveurs" -ForegroundColor White

Write-Host "`n✅ Script terminé!" -ForegroundColor Green 