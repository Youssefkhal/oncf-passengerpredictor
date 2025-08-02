import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os

# Ajouter le répertoire parent au path pour importer main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def load_sample_data():
    """Charge les données d'exemple dans la variable globale merged_data"""
    global merged_data
    
    try:
        # Lire les fichiers CSV d'exemple
        passengers_df = pd.read_csv('../sample_data/passengers.csv')
        evenements_df = pd.read_csv('../sample_data/evenements.csv')
        vacances_df = pd.read_csv('../sample_data/vacances.csv')
        
        print("📁 Fichiers CSV chargés avec succès")
        print(f"   Passengers: {passengers_df.shape}")
        print(f"   Événements: {evenements_df.shape}")
        print(f"   Vacances: {vacances_df.shape}")
        
        # Convertir les dates
        passengers_df['Date'] = pd.to_datetime(passengers_df['Date'])
        evenements_df['Date'] = pd.to_datetime(evenements_df['Date'])
        vacances_df['Date'] = pd.to_datetime(vacances_df['Date'])
        
        # Fusionner les données
        merged_data = passengers_df.merge(evenements_df, on='Date', how='left')
        merged_data = merged_data.merge(vacances_df, on='Date', how='left')
        
        # Remplir les valeurs manquantes
        merged_data['Événement_Présent'] = merged_data['Événement_Présent'].fillna(0)
        merged_data['Vacance'] = merged_data['Vacance'].fillna(0)
        merged_data['Description_Événement'] = merged_data['Description_Événement'].fillna('')
        
        # Convertir Date en string pour JSON
        merged_data['Date'] = merged_data['Date'].dt.strftime('%Y-%m-%d')
        
        print(f"✅ Données fusionnées: {merged_data.shape}")
        print(f"   Colonnes: {list(merged_data.columns)}")
        print(f"   Plage de dates: {merged_data['Date'].min()} à {merged_data['Date'].max()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du chargement des données: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Chargement des données d'exemple...")
    success = load_sample_data()
    if success:
        print("✅ Données d'exemple chargées avec succès!")
    else:
        print("❌ Échec du chargement des données d'exemple") 