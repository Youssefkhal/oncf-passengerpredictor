# Script de démarrage du backend ONCF pour Windows
Write-Host "🚀 Démarrage du backend ONCF..." -ForegroundColor Green

# Vérifier si Python est installé
try {
    $pythonVersion = python --version
    Write-Host "✅ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python n'est pas installé. Veuillez l'installer depuis https://python.org/" -ForegroundColor Red
    exit 1
}

# Vérifier si pip est installé
try {
    $pipVersion = pip --version
    Write-Host "✅ pip détecté: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip n'est pas installé. Veuillez l'installer avec Python" -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire backend
Set-Location backend

# Vérifier si requirements.txt existe
if (-not (Test-Path "requirements.txt")) {
    Write-Host "❌ Fichier requirements.txt non trouvé" -ForegroundColor Red
    exit 1
}

# Installer les dépendances si nécessaire
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow
pip install -r requirements.txt

# Démarrer le serveur
Write-Host "🌐 Démarrage du serveur FastAPI..." -ForegroundColor Green
Write-Host "📍 L'API sera accessible sur: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 Documentation API: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🔗 Le frontend peut se connecter sur: http://localhost:12001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload 