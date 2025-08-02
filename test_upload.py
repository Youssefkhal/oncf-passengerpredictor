import requests
import os

def test_upload():
    """Test de l'upload des fichiers CSV"""
    
    # Chemins des fichiers
    passengers_file = "../sample_data/passengers.csv"
    evenements_file = "../sample_data/evenements.csv"
    vacances_file = "../sample_data/vacances.csv"
    
    # Vérifier que les fichiers existent
    for file_path in [passengers_file, evenements_file, vacances_file]:
        if not os.path.exists(file_path):
            print(f"❌ Fichier manquant: {file_path}")
            return False
    
    print("📁 Fichiers trouvés, test d'upload...")
    
    # Upload des fichiers
    files = {
        'passengers_file': open(passengers_file, 'rb'),
        'evenements_file': open(evenements_file, 'rb'),
        'vacances_file': open(vacances_file, 'rb')
    }
    
    try:
        response = requests.post('http://localhost:8000/upload-csv', files=files)
        
        # Fermer les fichiers
        for file in files.values():
            file.close()
        
        print(f"📤 Upload: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Upload réussi!")
            print(f"   📊 Total records: {data.get('total_records', 0)}")
            print(f"   🎉 Events: {data.get('events_count', 0)}")
            print(f"   🏖️ Holidays: {data.get('holidays_count', 0)}")
            print(f"   📅 Date range: {data.get('date_range', {})}")
            
            # Afficher les colonnes
            if 'columns' in data:
                print(f"   📋 Colonnes: {data['columns']}")
            
            # Afficher un échantillon des données
            if 'sample_data' in data and data['sample_data']:
                print("   📄 Échantillon des données:")
                for i, row in enumerate(data['sample_data'][:3]):
                    print(f"      {i+1}. {row}")
            
            return True
        else:
            print(f"❌ Erreur: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur upload: {e}")
        return False

if __name__ == "__main__":
    print("🧪 TEST UPLOAD CSV")
    print("=" * 30)
    test_upload() 