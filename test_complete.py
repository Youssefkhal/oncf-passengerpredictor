import requests
import json

def test_complete_system():
    """Test complet du système"""
    print("🧪 TEST COMPLET DU SYSTÈME ONCF")
    print("=" * 50)
    
    # Test 1: Connexion
    print("\n1️⃣ Test de connexion...")
    try:
        response = requests.get("http://localhost:8000/test")
        if response.status_code == 200:
            print("✅ Connexion OK")
        else:
            print("❌ Erreur de connexion")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    # Test 2: Upload des données
    print("\n2️⃣ Test upload des données...")
    try:
        files = {
            'passengers_file': open('../sample_data/passengers.csv', 'rb'),
            'evenements_file': open('../sample_data/evenements.csv', 'rb'),
            'vacances_file': open('../sample_data/vacances.csv', 'rb')
        }
        
        response = requests.post('http://localhost:8000/upload-csv', files=files)
        
        # Fermer les fichiers
        for file in files.values():
            file.close()
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Upload réussi!")
            print(f"   📊 {data['total_records']} enregistrements")
            print(f"   🎉 {data['events_count']} événements")
            print(f"   🏖️ {data['holidays_count']} jours de vacances")
        else:
            print(f"❌ Erreur upload: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    # Test 3: Data Preview
    print("\n3️⃣ Test data preview...")
    try:
        response = requests.get("http://localhost:8000/data-preview")
        if response.status_code == 200:
            data = response.json()
            print("✅ Data preview OK")
            print(f"   📊 {data['total_records']} enregistrements")
            if data.get('merged_data'):
                print(f"   📋 {len(data['merged_data'])} données disponibles")
            else:
                print("   ⚠️ Aucune donnée dans merged_data")
        else:
            print(f"❌ Erreur data preview: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    # Test 4: Train & Predict
    print("\n4️⃣ Test entraînement et prédiction...")
    try:
        data = {
            "model_type": "Linear Regression",
            "days_to_predict": 7
        }
        
        response = requests.post('http://localhost:8000/train-and-predict', json=data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Entraînement et prédiction réussis!")
            print(f"   📈 R² Score: {result['model_performance']['r2']:.4f}")
            print(f"   📊 MSE: {result['model_performance']['mse']:.4f}")
            print(f"   🔮 {len(result['predictions'])} prédictions générées")
            
            # Afficher quelques prédictions
            if result['predictions']:
                print("   📄 Exemples de prédictions:")
                for i, pred in enumerate(result['predictions'][:3]):
                    print(f"      {i+1}. {pred['date']} - Train {pred['train_id']} → {pred['ville_arrivee']}: {pred['predicted_passengers']} passagers")
        else:
            print(f"❌ Erreur train & predict: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    # Test 5: Prediction History
    print("\n5️⃣ Test historique des prédictions...")
    try:
        response = requests.get("http://localhost:8000/prediction-history")
        if response.status_code == 200:
            data = response.json()
            print("✅ Historique des prédictions OK")
            print(f"   📚 {data['total_predictions']} prédictions dans l'historique")
        else:
            print(f"❌ Erreur historique: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    print("\n🎉 TOUS LES TESTS SONT PASSÉS!")
    print("✅ Le système fonctionne parfaitement!")
    return True

if __name__ == "__main__":
    test_complete_system() 