import requests
import json

def test_export():
    """Test de l'export CSV"""
    print("🧪 TEST EXPORT CSV")
    print("=" * 30)
    
    # Test 1: Vérifier qu'il y a des prédictions
    print("\n1️⃣ Vérification des prédictions...")
    try:
        response = requests.get("http://localhost:8000/prediction-history")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data['total_predictions']} prédictions dans l'historique")
            
            if data['total_predictions'] == 0:
                print("❌ Aucune prédiction trouvée. Créons d'abord une prédiction...")
                
                # Créer une prédiction
                print("\n2️⃣ Création d'une prédiction...")
                upload_response = requests.post('http://localhost:8000/upload-csv', files={
                    'passengers_file': open('../sample_data/passengers.csv', 'rb'),
                    'evenements_file': open('../sample_data/evenements.csv', 'rb'),
                    'vacances_file': open('../sample_data/vacances.csv', 'rb')
                })
                
                if upload_response.status_code == 200:
                    print("✅ Upload réussi")
                    
                    # Entraîner et prédire
                    train_response = requests.post('http://localhost:8000/train-and-predict', json={
                        "model_type": "Linear Regression",
                        "days_to_predict": 7
                    })
                    
                    if train_response.status_code == 200:
                        print("✅ Prédiction créée")
                    else:
                        print(f"❌ Erreur création prédiction: {train_response.text}")
                        return False
                else:
                    print(f"❌ Erreur upload: {upload_response.text}")
                    return False
        else:
            print(f"❌ Erreur historique: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    # Test 2: Export CSV
    print("\n3️⃣ Test export CSV...")
    try:
        response = requests.get("http://localhost:8000/export-predictions")
        
        if response.status_code == 200:
            print("✅ Export réussi!")
            print(f"   📄 Content-Type: {response.headers.get('content-type', 'N/A')}")
            print(f"   📊 Taille: {len(response.content)} bytes")
            
            # Vérifier le contenu CSV
            csv_content = response.text
            lines = csv_content.split('\n')
            print(f"   📋 Lignes: {len(lines)}")
            
            if len(lines) > 1:
                print("   📄 Première ligne (en-têtes):", lines[0])
                if len(lines) > 2:
                    print("   📄 Deuxième ligne (données):", lines[1])
            
            # Sauvegarder le fichier pour vérification
            with open('test_export.csv', 'w', encoding='utf-8') as f:
                f.write(csv_content)
            print("   💾 Fichier sauvegardé: test_export.csv")
            
            return True
        else:
            print(f"❌ Erreur export: {response.status_code}")
            print(f"   📄 Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur export: {e}")
        return False

if __name__ == "__main__":
    success = test_export()
    if success:
        print("\n🎉 EXPORT CSV FONCTIONNE!")
    else:
        print("\n❌ EXPORT CSV ÉCHOUÉ!") 