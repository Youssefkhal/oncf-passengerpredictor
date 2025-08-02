# Script de test pour l'API ONCF
Write-Host "🧪 TEST DE L'API ONCF" -ForegroundColor Green
Write-Host "=" * 50

# Test 1: Connexion
Write-Host "`n📡 Test de connexion..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/test" -Method Get
    Write-Host "✅ Connexion OK: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Data Preview
Write-Host "`n📊 Test Data Preview..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/data-preview" -Method Get
    Write-Host "✅ Data Preview OK" -ForegroundColor Green
    Write-Host "   📊 Total records: $($response.total_records)" -ForegroundColor Cyan
    Write-Host "   🎉 Events: $($response.events_count)" -ForegroundColor Cyan
    Write-Host "   🏖️ Holidays: $($response.holidays_count)" -ForegroundColor Cyan
    Write-Host "   📅 Date range: $($response.date_range.start) à $($response.date_range.end)" -ForegroundColor Cyan
    
    if ($response.merged_data -and $response.merged_data.Count -gt 0) {
        Write-Host "   📋 Données disponibles: $($response.merged_data.Count) enregistrements" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Aucune donnée disponible" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur Data Preview: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Train & Predict (si des données sont disponibles)
if ($response.total_records -gt 0) {
    Write-Host "`n🤖 Test Train & Predict..." -ForegroundColor Yellow
    try {
        $body = @{
            model_type = "Linear Regression"
            days_to_predict = 7
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:8000/train-and-predict" -Method Post -Body $body -ContentType "application/json"
        Write-Host "✅ Train & Predict OK" -ForegroundColor Green
        Write-Host "   📈 R² Score: $([math]::Round($response.r2_score, 4))" -ForegroundColor Cyan
        Write-Host "   📊 MSE: $([math]::Round($response.mse, 4))" -ForegroundColor Cyan
        Write-Host "   🔮 Prédictions: $($response.predictions.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Erreur Train & Predict: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Test terminé!" -ForegroundColor Green 