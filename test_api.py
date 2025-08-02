import requests
import json
import os

# Configuration
API_BASE_URL = "http://localhost:8000"

def test_connection():
    """Test de connexion à l'API"""
    try:
        response = requests.get(f"{API_BASE_URL}/test")
        print(f"✅ Connexion API: {response.status_code}")
        print(f"   Réponse: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

def test_data_preview():
    """Test de l'endpoint data-preview"""
    try:
        response = requests.get(f"{API_BASE_URL}/data-preview")
        print(f"📊 Data Preview: {response.status_code}")
        print(f"   Réponse: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erreur data-preview: {e}")
        return False

def test_upload():
    """Test de l'upload des fichiers CSV"""
    try:
        # Chemins des fichiers
        passengers_file = "sample_data/passengers.csv"
        evenements_file = "sample_data/evenements.csv"
        vacances_file = "sample_data/vacances.csv"
        
        # Vérifier que les fichiers existent
        for file_path in [passengers_file, evenements_file, vacances_file]:
            if not os.path.exists(file_path):
                print(f"❌ Fichier manquant: {file_path}")
                return False
        
        # Upload des fichiers
        files = {
            'passengers_file': open(passengers_file, 'rb'),
            'evenements_file': open(evenements_file, 'rb'),
            'vacances_file': open(vacances_file, 'rb')
        }
        
        response = requests.post(f"{API_BASE_URL}/upload-csv", files=files)
        
        # Fermer les fichiers
        for file in files.values():
            file.close()
        
        print(f"📁 Upload CSV: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Upload réussi!")
            print(f"   📊 Total records: {data.get('total_records', 0)}")
            print(f"   🎉 Events: {data.get('events_count', 0)}")
            print(f"   🏖️ Holidays: {data.get('holidays_count', 0)}")
            print(f"   📅 Date range: {data.get('date_range', {})}")
            return True
        else:
            print(f"   ❌ Erreur: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur upload: {e}")
        return False

def test_train_and_predict():
    """Test de l'entraînement et prédiction"""
    try:
        data = {
            "model_type": "Linear Regression",
            "days_to_predict": 7
        }
        
        response = requests.post(f"{API_BASE_URL}/train-and-predict", json=data)
        print(f"🤖 Train & Predict: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Entraînement réussi!")
            print(f"   📈 R² Score: {result.get('r2_score', 0):.4f}")
            print(f"   📊 MSE: {result.get('mse', 0):.4f}")
            print(f"   🔮 Prédictions: {len(result.get('predictions', []))}")
            return True
        else:
            print(f"   ❌ Erreur: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur train & predict: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🧪 DIAGNOSTIC DE L'API ONCF")
    print("=" * 50)
    
    # Test 1: Connexion
    if not test_connection():
        print("❌ Impossible de se connecter à l'API. Vérifiez que le backend est démarré.")
        return
    
    print()
    
    # Test 2: Data Preview (avant upload)
    print("📊 Test Data Preview (avant upload):")
    test_data_preview()
    
    print()
    
    # Test 3: Upload
    print("📁 Test Upload CSV:")
    if test_upload():
        print()
        
        # Test 4: Data Preview (après upload)
        print("📊 Test Data Preview (après upload):")
        test_data_preview()
        
        print()
        
        # Test 5: Train & Predict
        print("🤖 Test Train & Predict:")
        test_train_and_predict()
    else:
        print("❌ Upload échoué. Impossible de continuer les tests.")
    
    print()
    print("🏁 Diagnostic terminé!")

if __name__ == "__main__":
    main() 