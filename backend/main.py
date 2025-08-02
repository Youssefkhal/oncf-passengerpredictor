from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb
from datetime import datetime, timedelta
import json
import io
from typing import List, Dict, Any
from pydantic import BaseModel
import re

app = FastAPI(title="ONCF Passenger Prediction API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store data and models
merged_data = None
trained_models = {}
prediction_history = []
evenements_df = None
vacances_df = None
passengers_df = None

# Helper function to sanitize data for JSON
def sanitize_for_json(data):
    """
    Recursively replaces non-JSON compliant float values (NaN, inf) with None.
    """
    if isinstance(data, dict):
        return {k: sanitize_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_for_json(item) for item in data]
    elif isinstance(data, float) and (np.isinf(data) or np.isnan(data)):
        return None
    else:
        return data

def clean_and_parse_dates(date_series):
    """Clean and parse dates with various formats"""
    cleaned_dates = []

    for date_str in date_series:
        if pd.isna(date_str):
            cleaned_dates.append(pd.NaT)
            continue

        # Convert to string if not already
        date_str = str(date_str).strip()

        # Remove French text like "au", "du", etc.
        date_str = re.sub(r'\b(au|du|le|la|les|de|des|à|a)\b', '', date_str, flags=re.IGNORECASE)

        # Remove extra spaces
        date_str = re.sub(r'\s+', ' ', date_str).strip()

        # Try to extract just the date part (remove time if present)
        date_match = re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}', date_str)
        if date_match:
            date_str = date_match.group()

        try:
            # Try different date formats
            for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y/%m/%d', '%d-%m-%Y']:
                try:
                    parsed_date = pd.to_datetime(date_str, format=fmt)
                    cleaned_dates.append(parsed_date)
                    break
                except:
                    continue
            else:
                # If no format works, try pandas' automatic parsing
                try:
                    parsed_date = pd.to_datetime(date_str, dayfirst=True)
                    cleaned_dates.append(parsed_date)
                except:
                    print(f"Warning: Could not parse date '{date_str}', using NaT")
                    cleaned_dates.append(pd.NaT)
        except Exception as e:
            print(f"Error parsing date '{date_str}': {e}")
            cleaned_dates.append(pd.NaT)

    return pd.Series(cleaned_dates)

def merge_available_data():
    """Fusionne les données disponibles (passagers, événements, vacances)"""
    global merged_data, passengers_df, evenements_df, vacances_df

    if passengers_df is None:
        return None

    # Commencer avec les données passagers
    merged_data = passengers_df.copy()

    # Ajouter les événements si disponibles
    if evenements_df is not None:
        merged_data = merged_data.merge(evenements_df, on='Date', how='left')
        # Remplir les valeurs manquantes
        if 'Evenement_Present' in merged_data.columns:
            merged_data['Evenement_Present'] = merged_data['Evenement_Present'].fillna(0)
        else:
            merged_data['Evenement_Present'] = 0
        if 'Description_Evenement' in merged_data.columns:
            merged_data['Description_Evenement'] = merged_data['Description_Evenement'].fillna('')
        else:
            merged_data['Description_Evenement'] = ''
    else:
        # Ajouter des colonnes par défaut si pas d'événements
        merged_data['Evenement_Present'] = 0
        merged_data['Description_Evenement'] = ''

    # Ajouter les vacances si disponibles
    if vacances_df is not None:
        # Créer un DataFrame étendu pour les vacances avec tous les jours consécutifs
        vacances_extended = []
        for _, row in vacances_df.iterrows():
            date_debut = pd.to_datetime(row['Date'])
            duree_vacances = int(row.get('Vacance', 1))  # Valeur par défaut 1 si pas spécifiée

            # Créer une entrée pour chaque jour de vacance
            for i in range(duree_vacances):
                jour_vacance = date_debut + pd.Timedelta(days=i)
                vacances_extended.append({
                    'Date': jour_vacance,
                    'Vacance': 1,  # Marquer comme jour de vacance
                    'Type_Vacances': row.get('Type_Vacances', 'Vacance'),
                    'Titre_Vacances': row.get('Titre_Vacances', 'Vacance'),
                    'Description_Vacances': row.get('Description_Vacances', f'Vacance (jour {i+1}/{duree_vacances})')
                })

        if vacances_extended:
            vacances_extended_df = pd.DataFrame(vacances_extended)
            merged_data = merged_data.merge(vacances_extended_df, on='Date', how='left')
            if 'Vacance' in merged_data.columns:
                merged_data['Vacance'] = merged_data['Vacance'].fillna(0)
            else:
                merged_data['Vacance'] = 0
        else:
            merged_data['Vacance'] = 0
    else:
        # Ajouter une colonne par défaut si pas de vacances
        merged_data['Vacance'] = 0

    # Normalize column names for consistency - Enhanced version
    def normalize_column_names(df):
        """Normalise les noms de colonnes en gérant les accents et variations"""
        column_mapping = {
            # Variations pour les villes
            'Ville_Arrivée': 'Ville_Arrivee',
            'Ville_Arrivee': 'Ville_Arrivee',

            # Variations pour les événements
            'Événement_Présent': 'Evenement_Present',
            'Evenement_Present': 'Evenement_Present',
            'Event_Present': 'Evenement_Present',

            # Variations pour les descriptions d'événements
            'Description_Événement': 'Description_Evenement',
            'Description_Evenement': 'Description_Evenement',
            'Event_Description': 'Description_Evenement',

            # Variations pour les vacances
            'Vacance': 'Vacance',
            'Holiday': 'Vacance',
            'Vacation': 'Vacance'
        }

        # Appliquer le mapping
        for old_name, new_name in column_mapping.items():
            if old_name in df.columns:
                df = df.rename(columns={old_name: new_name})

        return df

    # Appliquer la normalisation
    merged_data = normalize_column_names(merged_data)

    # Convert Date back to string for JSON serialization
    merged_data['Date'] = merged_data['Date'].dt.strftime('%Y-%m-%d')

    return merged_data

# Load sample data on startup
def load_sample_data_on_startup():
    """Charge les données d'exemple au démarrage"""
    global merged_data, evenements_df, vacances_df
    try:
        import pandas as pd
        import os

        # Chemins des fichiers
        passengers_file = '../sample_data/passengers.csv'
        evenements_file = '../sample_data/evenements.csv'
        vacances_file = '../sample_data/vacances.csv'

        # Vérifier que les fichiers existent
        if not all(os.path.exists(f) for f in [passengers_file, evenements_file, vacances_file]):
            print("⚠️ Fichiers d'exemple non trouvés, démarrage sans données")
            return

        # Lire les fichiers CSV
        passengers_df = pd.read_csv(passengers_file)
        evenements_df = pd.read_csv(evenements_file)
        vacances_df = pd.read_csv(vacances_file)

        # Garder le nom original de la colonne avec accent
        # Pas besoin de renommer Description_Événement

        # Convertir les dates
        passengers_df['Date'] = clean_and_parse_dates(passengers_df['Date'])
        evenements_df['Date'] = clean_and_parse_dates(evenements_df['Date'])
        vacances_df['Date'] = clean_and_parse_dates(vacances_df['Date'])

        # Supprimer les lignes avec dates invalides
        passengers_df = passengers_df.dropna(subset=['Date'])
        evenements_df = evenements_df.dropna(subset=['Date'])
        vacances_df = vacances_df.dropna(subset=['Date'])

        # Fusionner les données
        merged_data = passengers_df.merge(evenements_df, on='Date', how='left')
        merged_data = merged_data.merge(vacances_df, on='Date', how='left')

        # Remplir les valeurs manquantes
        merged_data['Evenement_Present'] = merged_data['Evenement_Present'].fillna(0)
        merged_data['Vacance'] = merged_data['Vacance'].fillna(0)
        if 'Description_Evenement' in merged_data.columns:
            merged_data['Description_Evenement'] = merged_data['Description_Evenement'].fillna('')
        else:
            merged_data['Description_Evenement'] = ''

        # Normalize column names for consistency using the enhanced function
        def normalize_column_names_startup(df):
            """Normalise les noms de colonnes en gérant les accents et variations"""
            column_mapping = {
                # Variations pour les villes
                'Ville_Arrivée': 'Ville_Arrivee',
                'Ville_Arrivee': 'Ville_Arrivee',

                # Variations pour les événements
                'Événement_Présent': 'Evenement_Present',
                'Evenement_Present': 'Evenement_Present',
                'Event_Present': 'Evenement_Present',

                # Variations pour les descriptions d'événements
                'Description_Événement': 'Description_Evenement',
                'Description_Evenement': 'Description_Evenement',
                'Event_Description': 'Description_Evenement',

                # Variations pour les vacances
                'Vacance': 'Vacance',
                'Holiday': 'Vacance',
                'Vacation': 'Vacance'
            }

            # Appliquer le mapping
            for old_name, new_name in column_mapping.items():
                if old_name in df.columns:
                    df = df.rename(columns={old_name: new_name})

            return df

        # Appliquer la normalisation
        merged_data = normalize_column_names_startup(merged_data)

        # Convertir Date en string pour JSON
        merged_data['Date'] = merged_data['Date'].dt.strftime('%Y-%m-%d')

        print(f"✅ Données d'exemple chargées: {merged_data.shape[0]} enregistrements")

    except Exception as e:
        print(f"⚠️ Erreur lors du chargement des données d'exemple: {e}")

# Charger les données au démarrage
load_sample_data_on_startup()

class PredictionRequest(BaseModel):
    model_type: str
    days_to_predict: int

class PredictionResult(BaseModel):
    date: str
    train_id: str
    ville_arrivee: str
    predicted_passengers: float

@app.get("/")
async def root():
    return {"message": "ONCF Passenger Prediction API"}

@app.get("/test")
async def test_connection():
    return {"status": "ok", "message": "Backend is running", "timestamp": datetime.now().isoformat()}

@app.post("/test-upload")
async def test_upload(
    passengers_file: UploadFile = File(...),
    evenements_file: UploadFile = File(...),
    vacances_file: UploadFile = File(...)
):
    """Test endpoint for file upload"""
    try:
        # Just read the files and return basic info
        passengers_content = await passengers_file.read()
        evenements_content = await evenements_file.read()
        vacances_content = await vacances_file.read()

        return {
            "message": "Files received successfully",
            "passengers_file_size": len(passengers_content),
            "evenements_file_size": len(evenements_content),
            "vacances_file_size": len(vacances_content),
            "passengers_filename": passengers_file.filename,
            "evenements_filename": evenements_file.filename,
            "vacances_filename": vacances_file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Test upload failed: {str(e)}")

@app.get("/data-preview")
async def get_data_preview():
    global merged_data

    if merged_data is None:
        return {
            "total_records": 0,
            "passengers_count": 0,
            "events_count": 0,
            "holidays_count": 0,
            "date_range": None,
            "last_updated": None
        }

    try:
        # Calculate statistics correctly
        total_records = len(merged_data)
        passengers_count = total_records  # Each row is a passenger record
        events_count = merged_data['Evenement_Present'].sum() if 'Evenement_Present' in merged_data.columns else 0
        holidays_count = merged_data['Vacance'].sum() if 'Vacance' in merged_data.columns else 0

        # Date range
        if 'Date' in merged_data.columns:
            # Convert string dates back to datetime for range calculation
            dates = pd.to_datetime(merged_data['Date'])
            date_range = {
                "start": dates.min().strftime('%Y-%m-%d'),
                "end": dates.max().strftime('%Y-%m-%d')
            }
        else:
            date_range = None

        print(f"Data preview - Total: {total_records}, Passengers: {passengers_count}, Events: {events_count}, Holidays: {holidays_count}")
        
        # FIX: Sanitize the merged_data DataFrame before converting to dictionary
        # This is the key change to handle non-compliant float values.
        sanitized_data = merged_data.replace([np.inf, -np.inf, np.nan], None).to_dict('records')
        
        return {
            "total_records": total_records,
            "passengers_count": passengers_count,
            "events_count": int(events_count),
            "holidays_count": int(holidays_count),
            "date_range": date_range,
            "last_updated": datetime.now().isoformat(),
            "merged_data": sanitized_data if merged_data is not None else []
        }
    except Exception as e:
        print(f"Error in data preview: {e}")
        # Add a detailed error message to help debugging
        raise HTTPException(status_code=500, detail=f"Error getting data preview: {str(e)}. This might be due to non-JSON compliant float values (like NaN or Inf) in the data. Make sure your data is clean.")

@app.post("/upload-csv")
async def upload_csv_files(
    passengers_file: UploadFile = File(...),
    evenements_file: UploadFile = File(...),
    vacances_file: UploadFile = File(...)
):
    global merged_data, evenements_df, vacances_df

    try:
        # Read CSV files
        passengers_content = await passengers_file.read()
        evenements_content = await evenements_file.read()
        vacances_content = await vacances_file.read()

        # Parse CSV data with error handling
        try:
            passengers_df = pd.read_csv(io.StringIO(passengers_content.decode('utf-8')))
            evenements_df = pd.read_csv(io.StringIO(evenements_content.decode('utf-8')))
            vacances_df = pd.read_csv(io.StringIO(vacances_content.decode('utf-8')))
        except UnicodeDecodeError:
            # Try with different encoding
            passengers_df = pd.read_csv(io.StringIO(passengers_content.decode('latin-1')))
            evenements_df = pd.read_csv(io.StringIO(evenements_content.decode('latin-1')))
            vacances_df = pd.read_csv(io.StringIO(vacances_content.decode('latin-1')))

        print(f"Passengers columns: {list(passengers_df.columns)}")
        print(f"Events columns: {list(evenements_df.columns)}")
        print(f"Holidays columns: {list(vacances_df.columns)}")

        # Clean and convert Date columns to datetime
        passengers_df['Date'] = clean_and_parse_dates(passengers_df['Date'])
        evenements_df['Date'] = clean_and_parse_dates(evenements_df['Date'])
        vacances_df['Date'] = clean_and_parse_dates(vacances_df['Date'])

        # Remove rows with invalid dates
        passengers_df = passengers_df.dropna(subset=['Date'])
        evenements_df = evenements_df.dropna(subset=['Date'])
        vacances_df = vacances_df.dropna(subset=['Date'])

        print(f"Passengers data shape: {passengers_df.shape}")
        print(f"Events data shape: {evenements_df.shape}")
        print(f"Holidays data shape: {vacances_df.shape}")

        # Merge datasets on Date - use left join to keep all passenger records
        # First, let's check the date ranges
        print(f"Passengers date range: {passengers_df['Date'].min()} to {passengers_df['Date'].max()}")
        print(f"Events date range: {evenements_df['Date'].min()} to {evenements_df['Date'].max()}")
        print(f"Holidays date range: {vacances_df['Date'].min()} to {vacances_df['Date'].max()}")

        # Check for duplicate dates in each dataset
        print(f"Passengers unique dates: {passengers_df['Date'].nunique()}")
        print(f"Events unique dates: {evenements_df['Date'].nunique()}")
        print(f"Holidays unique dates: {vacances_df['Date'].nunique()}")

        # Merge datasets on Date - use left join to keep all passenger records
        merged_data = passengers_df.merge(evenements_df, on='Date', how='left')
        print(f"After first merge shape: {merged_data.shape}")

        merged_data = merged_data.merge(vacances_df, on='Date', how='left')
        print(f"After second merge shape: {merged_data.shape}")

        print(f"Merged data shape: {merged_data.shape}")
        print(f"Merged columns: {list(merged_data.columns)}")

        # Check for missing values after merge
        print(f"Missing Événement_Présent: {merged_data['Événement_Présent'].isna().sum()}")
        print(f"Missing Vacance: {merged_data['Vacance'].isna().sum()}")

        # Fill missing values
        if 'Événement_Présent' in merged_data.columns:
            merged_data['Événement_Présent'] = merged_data['Événement_Présent'].fillna(0)
        else:
            merged_data['Événement_Présent'] = 0

        if 'Vacance' in merged_data.columns:
            merged_data['Vacance'] = merged_data['Vacance'].fillna(0)
        else:
            merged_data['Vacance'] = 0

        if 'Description_Événement' in merged_data.columns:
            merged_data['Description_Événement'] = merged_data['Description_Événement'].fillna('')
        else:
            merged_data['Description_Événement'] = ''

        # Normalize column names for consistency
        column_mapping = {
            'Ville_Arrivée': 'Ville_Arrivee',
            'Événement_Présent': 'Evenement_Present'
            # Garder Description_Événement avec accent
        }

        # Rename columns to normalized names
        for old_name, new_name in column_mapping.items():
            if old_name in merged_data.columns:
                merged_data = merged_data.rename(columns={old_name: new_name})

        # Ensure all required columns exist
        required_columns = ['Date', 'Train_ID', 'Ville_Arrivee', 'Nombre_Passagers', 'Evenement_Present', 'Vacance']
        for col in required_columns:
            if col not in merged_data.columns:
                raise HTTPException(status_code=400, detail=f"Missing required column: {col}")

        # Convert Date back to string for JSON serialization
        merged_data['Date'] = merged_data['Date'].dt.strftime('%Y-%m-%d')

        print(f"Final merged data shape: {merged_data.shape}")
        print(f"Sample data: {merged_data.head(3).to_dict('records')}")

        # Calculate final statistics
        total_records = len(merged_data)
        passengers_count = len(merged_data)  # Each row represents a passenger record
        events_count = merged_data['Evenement_Present'].sum()
        holidays_count = merged_data['Vacance'].sum()

        print(f"Final stats - Total: {total_records}, Passengers: {passengers_count}, Events: {events_count}, Holidays: {holidays_count}")

        # Mettre à jour les variables globales pour les prédictions futures
        evenements_df = evenements_df.copy()
        vacances_df = vacances_df.copy()

        return {
            "message": "Files uploaded and merged successfully",
            "total_records": total_records,
            "passengers_count": passengers_count,
            "events_count": int(events_count),
            "holidays_count": int(holidays_count),
            "columns": list(merged_data.columns),
            "sample_data": merged_data.head(5).replace([np.inf, -np.inf, np.nan], None).to_dict('records'),
            "merged_data": merged_data.replace([np.inf, -np.inf, np.nan], None).to_dict('records'),
            "date_range": {
                "start": merged_data['Date'].min(),
                "end": merged_data['Date'].max()
            },
            "last_updated": datetime.now().isoformat()
        }

    except Exception as e:
        print(f"Error processing files: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error processing files: {str(e)}")

@app.post("/train-and-predict")
async def train_and_predict(request: PredictionRequest):
    global merged_data, trained_models, prediction_history, evenements_df, vacances_df

    if merged_data is None:
        raise HTTPException(status_code=400, detail="No data uploaded. Please upload CSV files first.")

    try:
        # Prepare features
        df = merged_data.copy()

        # Convert Date back to datetime for processing
        df['Date'] = pd.to_datetime(df['Date'])

        # Create label encoders for categorical variables
        le_train = LabelEncoder()
        le_ville = LabelEncoder()

        df['Train_ID_encoded'] = le_train.fit_transform(df['Train_ID'])
        df['Ville_Arrivée_encoded'] = le_ville.fit_transform(df['Ville_Arrivee'])

        # Create date features
        df['day_of_year'] = df['Date'].dt.dayofyear
        df['month'] = df['Date'].dt.month
        df['day_of_week'] = df['Date'].dt.dayofweek

        # Prepare feature matrix
        feature_columns = ['Train_ID_encoded', 'Ville_Arrivée_encoded', 'day_of_year',
                          'month', 'day_of_week', 'Evenement_Present', 'Vacance']
        X = df[feature_columns]
        y = df['Nombre_Passagers']

        # Split data for training
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train selected model
        if request.model_type == "Linear Regression":
            model = LinearRegression()
        elif request.model_type == "Random Forest":
            model = RandomForestRegressor(n_estimators=100, random_state=42)
        elif request.model_type == "XGBoost":
            model = xgb.XGBRegressor(n_estimators=100, random_state=42)
        else:
            raise HTTPException(status_code=400, detail="Invalid model type")

        # Train the model
        model.fit(X_train, y_train)

        # Evaluate model
        y_pred_test = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred_test)
        r2 = r2_score(y_test, y_pred_test)

        # Store trained model
        trained_models[request.model_type] = {
            'model': model,
            'le_train': le_train,
            'le_ville': le_ville,
            'feature_columns': feature_columns,
            'mse': mse,
            'r2': r2
        }

        # Générer les prédictions pour les dates futures
        last_date = df['Date'].max()
        future_dates = [last_date + timedelta(days=i+1) for i in range(request.days_to_predict)]
        predictions = []
        unique_trains = df['Train_ID'].unique()
        unique_villes = df['Ville_Arrivee'].unique()
        # S'assurer que les colonnes Date sont bien en datetime
        if evenements_df is not None and 'Date' in evenements_df.columns:
            evenements_df['Date'] = pd.to_datetime(evenements_df['Date'])
        if vacances_df is not None and 'Date' in vacances_df.columns:
            vacances_df['Date'] = pd.to_datetime(vacances_df['Date'])
        for date in future_dates:
            # Chercher si la date est un événement ou une vacance
            event_present = 0
            vacance_present = 0
            event_name = ""
            vacance_name = ""
            vacance_duration = 0

            if evenements_df is not None and 'Date' in evenements_df.columns and 'Evenement_Present' in evenements_df.columns:
                match = evenements_df[evenements_df['Date'] == date]
                if not match.empty:
                    event_present = int(match.iloc[0]['Evenement_Present'])
                    # Récupérer le nom de l'événement s'il existe
                    if 'Description_Evenement' in match.columns:
                        event_name = str(match.iloc[0]['Description_Evenement'])
                    elif 'Description_Événement' in match.columns:
                        event_name = str(match.iloc[0]['Description_Événement'])
                    elif 'Nom_Événement' in match.columns:
                        event_name = str(match.iloc[0]['Nom_Événement'])
                    elif 'Description' in match.columns:
                        event_name = str(match.iloc[0]['Description'])
                    else:
                        event_name = "Événement"

            # Chercher les vacances avec gestion des durées multiples
            if vacances_df is not None and 'Date' in vacances_df.columns and 'Vacance' in vacances_df.columns:
                # Vérifier si cette date est dans une période de vacances
                for _, vacance_row in vacances_df.iterrows():
                    date_debut_vacance = pd.to_datetime(vacance_row['Date'])
                    duree_vacance = int(vacance_row.get('Vacance', 1))

                    # Vérifier si la date actuelle est dans la période de vacances
                    if date_debut_vacance <= date < date_debut_vacance + pd.Timedelta(days=duree_vacance):
                        vacance_present = 1
                        vacance_duration = duree_vacance
                        # Récupérer le nom de la vacance
                        if 'Titre_Vacances' in vacance_row:
                            vacance_name = str(vacance_row['Titre_Vacances'])
                        elif 'Description' in vacance_row:
                            vacance_name = str(vacance_row['Description'])
                        else:
                            vacance_name = "Vacance"
                        break
            for train_id in unique_trains:
                for ville in unique_villes:
                    train_encoded = le_train.transform([train_id])[0]
                    ville_encoded = le_ville.transform([ville])[0]
                    prediction_df = pd.DataFrame({
                        'Train_ID_encoded': [train_encoded],
                        'Ville_Arrivée_encoded': [ville_encoded],
                        'day_of_year': [date.dayofyear],
                        'month': [date.month],
                        'day_of_week': [date.dayofweek],
                        'Evenement_Present': [event_present],
                        'Vacance': [vacance_present]
                    })
                    pred_passengers = model.predict(prediction_df)[0]
                    predictions.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'train_id': train_id,
                        'ville_arrivee': ville,
                        'predicted_passengers': max(0, round(pred_passengers)),
                        'event_present': event_present,
                        'vacance_present': vacance_present,
                        'event_name': event_name,
                        'vacance_name': vacance_name,
                        'vacance_duration': vacance_duration
                    })

        # Store prediction in history
        prediction_record = {
            'id': len(prediction_history) + 1,
            'model_type': request.model_type,
            'days_predicted': request.days_to_predict,
            'predictions_count': len(predictions),
            'predictions': sanitize_for_json(predictions),  # Sanitize predictions before storing
            'model_performance': {
                'mse': mse,
                'r2': r2
            },
            'created_at': datetime.now().isoformat(),
            'status': 'completed'
        }
        prediction_history.append(prediction_record)

        return {
            'message': f'Model {request.model_type} trained and predictions generated successfully',
            'predictions': sanitize_for_json(predictions), # Sanitize predictions before returning
            'model_performance': {
                'r2': r2,
                'mse': mse,
                'accuracy': r2  # Use R² as accuracy metric
            },
            'prediction_count': len(predictions),
            'prediction_id': prediction_record['id']
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during training and prediction: {str(e)}")

@app.get("/prediction-history")
async def get_prediction_history():
    return {
        "history": prediction_history,
        "total_predictions": len(prediction_history)
    }

@app.get("/export-predictions")
async def export_predictions():
    if not prediction_history:
        raise HTTPException(status_code=404, detail="No predictions found")

    try:
        # Get the latest prediction
        latest_prediction = prediction_history[-1]

        if 'predictions' not in latest_prediction or not latest_prediction['predictions']:
            raise HTTPException(status_code=404, detail="No predictions data found in latest prediction")

        # Convert to DataFrame for CSV export
        df = pd.DataFrame(latest_prediction['predictions'])

        # Convert to CSV
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_content = csv_buffer.getvalue()

        # Generate filename
        model_name = latest_prediction['model_type'].replace(' ', '_')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"predictions_{model_name}_{timestamp}.csv"

        # Return CSV file
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        print(f"Error in export_predictions: {e}")
        raise HTTPException(status_code=500, detail=f"Error exporting predictions: {str(e)}")

@app.delete("/delete-row")
async def delete_row(index: int = None, date: str = None, train_id: str = None, ville_arrivee: str = None):
    """Supprime une ligne de merged_data par index ou par (date, train_id, ville_arrivee)"""
    global merged_data
    if merged_data is None:
        raise HTTPException(status_code=400, detail="Aucune donnée chargée.")
    df = merged_data.copy()
    if index is not None:
        if index < 0 or index >= len(df):
            raise HTTPException(status_code=404, detail="Index hors limites.")
        df = df.drop(df.index[index])
    elif date and train_id and ville_arrivee:
        mask = (df['Date'] == date) & (df['Train_ID'] == train_id) & (df['Ville_Arrivee'] == ville_arrivee)
        if not mask.any():
            raise HTTPException(status_code=404, detail="Ligne non trouvée.")
        df = df[~mask]
    else:
        raise HTTPException(status_code=400, detail="Fournir index ou (date, train_id, ville_arrivee)")
    merged_data = df.reset_index(drop=True)
    return {"message": "Ligne supprimée avec succès.", "total_records": len(merged_data)}

@app.put("/edit-row")
async def edit_row(
    index: int = Body(None),
    date: str = Body(None),
    train_id: str = Body(None),
    ville_arrivee: str = Body(None),
    update_fields: dict = Body(...)
):
    """Modifie une ligne de merged_data par index ou par (date, train_id, ville_arrivee)"""
    global merged_data
    if merged_data is None:
        raise HTTPException(status_code=400, detail="Aucune donnée chargée.")
    df = merged_data.copy()
    row_idx = None
    if index is not None:
        if index < 0 or index >= len(df):
            raise HTTPException(status_code=404, detail="Index hors limites.")
        row_idx = index
    elif date and train_id and ville_arrivee:
        mask = (df['Date'] == date) & (df['Train_ID'] == train_id) & (df['Ville_Arrivee'] == ville_arrivee)
        if not mask.any():
            raise HTTPException(status_code=404, detail="Ligne non trouvée.")
        row_idx = df[mask].index[0]
    else:
        raise HTTPException(status_code=400, detail="Fournir index ou (date, train_id, ville_arrivee)")
    # Mettre à jour les champs
    for k, v in update_fields.items():
        if k in df.columns:
            df.at[row_idx, k] = v
    merged_data = df
    return {"message": "Ligne modifiée avec succès.", "row": df.iloc[row_idx].to_dict()}

@app.post("/reset-data")
async def reset_data():
    global merged_data, evenements_df, vacances_df, prediction_history
    merged_data = None
    evenements_df = None
    vacances_df = None
    prediction_history = []
    return {"message": "Données réinitialisées."}

@app.post("/upload-passengers")
async def upload_passengers_file(passengers_file: UploadFile = File(...)):
    """Upload du fichier passagers uniquement"""
    global passengers_df

    try:
        passengers_content = await passengers_file.read()

        try:
            passengers_df = pd.read_csv(io.StringIO(passengers_content.decode('utf-8')))
        except UnicodeDecodeError:
            passengers_df = pd.read_csv(io.StringIO(passengers_content.decode('latin-1')))

        # Clean and convert Date column
        passengers_df['Date'] = clean_and_parse_dates(passengers_df['Date'])
        passengers_df = passengers_df.dropna(subset=['Date'])

        # Fusionner automatiquement si tous les fichiers sont présents
        merged_data = merge_available_data()

        return {
            "message": "Fichier passagers uploadé avec succès",
            "passengers_count": len(passengers_df),
            "merged_available": merged_data is not None,
            "total_records": len(merged_data) if merged_data is not None else 0,
            "missing_files": []
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors du traitement du fichier passagers: {str(e)}")

@app.post("/upload-events")
async def upload_events_file(evenements_file: UploadFile = File(...)):
    """Upload du fichier événements uniquement"""
    global evenements_df

    try:
        evenements_content = await evenements_file.read()

        try:
            evenements_df = pd.read_csv(io.StringIO(evenements_content.decode('utf-8')))
        except UnicodeDecodeError:
            evenements_df = pd.read_csv(io.StringIO(evenements_content.decode('latin-1')))

        # Clean and convert Date column
        evenements_df['Date'] = clean_and_parse_dates(evenements_df['Date'])
        evenements_df = evenements_df.dropna(subset=['Date'])

        # Fusionner automatiquement si tous les fichiers sont présents
        merged_data = merge_available_data()

        return {
            "message": "Fichier événements uploadé avec succès",
            "events_count": len(evenements_df),
            "merged_available": merged_data is not None,
            "total_records": len(merged_data) if merged_data is not None else 0,
            "missing_files": []
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors du traitement du fichier événements: {str(e)}")

@app.post("/upload-holidays")
async def upload_holidays_file(vacances_file: UploadFile = File(...)):
    """Upload du fichier vacances uniquement"""
    global vacances_df

    try:
        vacances_content = await vacances_file.read()

        try:
            vacances_df = pd.read_csv(io.StringIO(vacances_content.decode('utf-8')))
        except UnicodeDecodeError:
            vacances_df = pd.read_csv(io.StringIO(vacances_content.decode('latin-1')))

        # Clean and convert Date column
        vacances_df['Date'] = clean_and_parse_dates(vacances_df['Date'])
        vacances_df = vacances_df.dropna(subset=['Date'])

        # Fusionner automatiquement si tous les fichiers sont présents
        merged_data = merge_available_data()

        return {
            "message": "Fichier vacances uploadé avec succès",
            "holidays_count": len(vacances_df),
            "merged_available": merged_data is not None,
            "total_records": len(merged_data) if merged_data is not None else 0,
            "missing_files": []
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors du traitement du fichier vacances: {str(e)}")

@app.get("/future-events")
async def get_future_events():
    """Récupère les événements et vacances futures"""
    global merged_data, evenements_df, vacances_df

    if merged_data is None:
        return {"future_events": [], "future_holidays": []}

    try:
        # Trouver la dernière date des données passagers
        last_date = pd.to_datetime(merged_data['Date'].max())

        future_events = []
        future_holidays = []

        # Chercher les événements futurs
        if evenements_df is not None and 'Date' in evenements_df.columns:
            evenements_df['Date'] = pd.to_datetime(evenements_df['Date'])
            future_events_df = evenements_df[evenements_df['Date'] > last_date]

            for _, row in future_events_df.iterrows():
                future_events.append({
                    'date': row['Date'].strftime('%Y-%m-%d'),
                    'description': row.get('Description_Événement', 'Événement'),
                    'type': row.get('Type_Événement', 'Événement')
                })

        # Chercher les vacances futures avec gestion des jours consécutifs
        if vacances_df is not None and 'Date' in vacances_df.columns:
            vacances_df['Date'] = pd.to_datetime(vacances_df['Date'])
            future_holidays_df = vacances_df[vacances_df['Date'] > last_date]

            for _, row in future_holidays_df.iterrows():
                date_debut = row['Date']
                duree_vacances = int(row.get('Vacance', 1))  # Valeur par défaut 1

                # Créer une entrée pour chaque jour de vacance
                for i in range(duree_vacances):
                    jour_vacance = date_debut + pd.Timedelta(days=i)
                    future_holidays.append({
                        'date': jour_vacance.strftime('%Y-%m-%d'),
                        'type': row.get('Type_Vacances', 'Vacance'),
                        'titre': row.get('Titre_Vacances', 'Vacance'),
                        'description': f"{row.get('Description_Vacances', 'Vacance')} (jour {i+1}/{duree_vacances})",
                        'duree_totale': duree_vacances,
                        'jour_dans_sequence': i + 1
                    })

        return {
            "future_events": sorted(future_events, key=lambda x: x['date']),
            "future_holidays": sorted(future_holidays, key=lambda x: x['date'])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des événements futurs: {str(e)}")

@app.get("/current-date-info")
async def get_current_date_info():
    """Récupère les informations pour la date actuelle (événements, vacances, prédiction moyenne)"""
    global merged_data, evenements_df, vacances_df

    try:
        from datetime import date
        current_date = date.today()
        current_date_str = current_date.strftime('%Y-%m-%d')

        # Initialiser les résultats
        result = {
            "date": current_date_str,
            "formatted_date": current_date.strftime('%d/%m/%Y'),
            "average_prediction": 0,
            "events": [],
            "holidays": [],
            "has_events": False,
            "has_holidays": False
        }

        # Calculer la prédiction moyenne si des données sont disponibles
        if merged_data is not None and len(merged_data) > 0:
            # Prendre la moyenne des passagers des données existantes comme estimation
            avg_passengers = merged_data['Nombre_Passagers'].mean()
            # FIX: Ensure avg_passengers is a valid number before rounding
            if pd.isna(avg_passengers) or np.isinf(avg_passengers):
                result["average_prediction"] = None
            else:
                result["average_prediction"] = round(avg_passengers)

        # Chercher les événements pour la date actuelle
        if evenements_df is not None and 'Date' in evenements_df.columns:
            evenements_df['Date'] = pd.to_datetime(evenements_df['Date'])
            current_events = evenements_df[evenements_df['Date'].dt.date == current_date]

            for _, event in current_events.iterrows():
                if event.get('Evenement_Present', 0) == 1:
                    event_name = ""
                    if 'Description_Evenement' in event:
                        event_name = str(event['Description_Evenement'])
                    elif 'Description_Événement' in event:
                        event_name = str(event['Description_Événement'])
                    else:
                        event_name = "Événement"

                    result["events"].append({
                        "name": event_name,
                        "description": event_name
                    })
                    result["has_events"] = True

        # Chercher les vacances pour la date actuelle
        if vacances_df is not None and 'Date' in vacances_df.columns:
            vacances_df['Date'] = pd.to_datetime(vacances_df['Date'])

            # Vérifier si la date actuelle est dans une période de vacances
            for _, vacance in vacances_df.iterrows():
                date_debut_vacance = vacance['Date'].date()
                duree_vacance = int(vacance.get('Vacance', 1))

                # Vérifier si la date actuelle est dans la période de vacances
                for i in range(duree_vacance):
                    jour_vacance = date_debut_vacance + pd.Timedelta(days=i).to_pytimedelta()
                    if jour_vacance == current_date:
                        vacance_name = "Vacance"
                        if 'Titre_Vacances' in vacance:
                            vacance_name = str(vacance['Titre_Vacances'])
                        elif 'Description' in vacance:
                            vacance_name = str(vacance['Description'])

                        result["holidays"].append({
                            "name": vacance_name,
                            "description": f"{vacance_name} (jour {i+1}/{duree_vacance})",
                            "duration": duree_vacance,
                            "day_in_sequence": i + 1
                        })
                        result["has_holidays"] = True
                        break

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des informations de la date actuelle: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)