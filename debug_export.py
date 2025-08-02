import requests
import json

def debug_export():
    """Debug de l'export CSV"""
    print("🐛 DEBUG EXPORT CSV")
    print("=" * 30)
    
    # Test 1: Vérifier l'historique
    print("\n1️⃣ Vérification de l'historique...")
    try:
        response = requests.get("http://localhost:8000/prediction-history")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data['total_predictions']} prédictions dans l'historique")
            
            if data['history']:
                latest = data['history'][-1]
                print(f"   📊 Dernière prédiction: ID {latest['id']}")
                print(f"   🎯 Modèle: {latest['model_type']}")
                print(f"   📅 Jours prédits: {latest['days_predicted']}")
                print(f"   📋 Clés disponibles: {list(latest.keys())}")
                
                if 'predictions' in latest:
                    print(f"   ✅ Prédictions stockées: {len(latest['predictions'])}")
                    if latest['predictions']:
                        print(f"   📄 Exemple: {latest['predictions'][0]}")
                else:
                    print("   ❌ Pas de prédictions stockées")
            else:
                print("   ❌ Historique vide")
        else:
            print(f"❌ Erreur historique: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    # Test 2: Export CSV avec debug
    print("\n2️⃣ Test export CSV avec debug...")
    try:
        response = requests.get("http://localhost:8000/export-predictions")
        
        print(f"   📊 Status Code: {response.status_code}")
        print(f"   📄 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Export réussi!")
            print(f"   📊 Taille: {len(response.content)} bytes")
            
            # Vérifier le contenu CSV
            csv_content = response.text
            lines = csv_content.split('\n')
            print(f"   📋 Lignes: {len(lines)}")
            
            if len(lines) > 1:
                print("   📄 Première ligne (en-têtes):", lines[0])
                if len(lines) > 2:
                    print("   📄 Deuxième ligne (données):", lines[1])
            
            return True
        else:
            print(f"❌ Erreur export: {response.status_code}")
            print(f"   📄 Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur export: {e}")
        return False

if __name__ == "__main__":
    success = debug_export()
    if success:
        print("\n🎉 EXPORT CSV FONCTIONNE!")
    else:
        print("\n❌ EXPORT CSV ÉCHOUÉ!") 