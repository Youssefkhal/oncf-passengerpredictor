import requests
import json

def test_frontend_integration():
    """Test de l'intégration frontend-backend"""
    print("🧪 TEST INTÉGRATION FRONTEND-BACKEND")
    print("=" * 50)
    
    # Test 1: Backend API
    print("\n1️⃣ Test Backend API...")
    try:
        # Test connexion
        response = requests.get("http://localhost:8000/test")
        if response.status_code == 200:
            print("✅ Backend connecté")
        else:
            print("❌ Backend non accessible")
            return False
        
        # Test data preview
        response = requests.get("http://localhost:8000/data-preview")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Data preview: {data['total_records']} records")
            if data.get('merged_data'):
                print(f"   📋 {len(data['merged_data'])} données disponibles")
                
                # Vérifier les colonnes
                if data['merged_data']:
                    sample = data['merged_data'][0]
                    print(f"   📊 Colonnes disponibles: {list(sample.keys())}")
                    
                    # Vérifier les événements et vacances
                    events_count = sum(1 for item in data['merged_data'] if item.get('Evenement_Present') == 1)
                    vacances_count = sum(1 for item in data['merged_data'] if item.get('Vacance') == 1)
                    print(f"   🎉 Événements détectés: {events_count}")
                    print(f"   🏖️ Vacances détectées: {vacances_count}")
            else:
                print("   ⚠️ Aucune donnée dans merged_data")
        else:
            print("❌ Erreur data preview")
            return False
            
    except Exception as e:
        print(f"❌ Erreur backend: {e}")
        return False
    
    # Test 2: Frontend accessible
    print("\n2️⃣ Test Frontend...")
    try:
        response = requests.get("http://localhost:12001")
        if response.status_code == 200:
            print("✅ Frontend accessible")
        else:
            print("❌ Frontend non accessible")
            return False
    except Exception as e:
        print(f"❌ Erreur frontend: {e}")
        return False
    
    # Test 3: Upload test
    print("\n3️⃣ Test Upload...")
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
            print("✅ Upload réussi")
            print(f"   📊 {data['total_records']} records")
            print(f"   🎉 {data['events_count']} événements")
            print(f"   🏖️ {data['holidays_count']} vacances")
            
            # Vérifier les données d'échantillon
            if data.get('sample_data'):
                sample = data['sample_data'][0]
                print(f"   📋 Exemple: {sample['Date']} - Train {sample['Train_ID']} → {sample['Ville_Arrivee']}")
                if sample.get('Evenement_Present') == 1:
                    print(f"      🎉 Événement: {sample.get('Description_Evenement', 'N/A')}")
                if sample.get('Vacance') == 1:
                    print(f"      🏖️ Vacances")
        else:
            print(f"❌ Erreur upload: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur upload: {e}")
        return False
    
    # Test 4: Train & Predict
    print("\n4️⃣ Test Train & Predict...")
    try:
        data = {
            "model_type": "Linear Regression",
            "days_to_predict": 7
        }
        
        response = requests.post('http://localhost:8000/train-and-predict', json=data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Train & Predict réussi")
            print(f"   📈 R² Score: {result['model_performance']['r2']:.4f}")
            print(f"   📊 MSE: {result['model_performance']['mse']:.4f}")
            print(f"   🔮 {len(result['predictions'])} prédictions")
            
            # Vérifier les prédictions
            if result['predictions']:
                pred = result['predictions'][0]
                print(f"   📄 Exemple prédiction: {pred['date']} - Train {pred['train_id']} → {pred['ville_arrivee']}: {pred['predicted_passengers']} passagers")
        else:
            print(f"❌ Erreur train & predict: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur train & predict: {e}")
        return False
    
    print("\n🎉 TOUS LES TESTS SONT PASSÉS!")
    print("✅ L'application est prête à être utilisée!")
    print("\n🌐 URLs d'accès:")
    print("   Frontend: http://localhost:12001")
    print("   Backend: http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    test_frontend_integration() 