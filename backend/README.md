# ONCF Passenger Prediction Backend

API FastAPI pour la prédiction de passagers ONCF avec machine learning.

## 🚀 Démarrage Rapide

### Méthode 1: Script automatique (Recommandé)
```bash
# Windows
.\start_backend.ps1

# Linux/Mac
./start_backend.sh
```

### Méthode 2: Manuel
```bash
# 1. Installer les dépendances
pip install -r requirements.txt

# 2. Démarrer le serveur
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📍 URLs d'accès

- **API** : http://localhost:8000
- **Documentation interactive** : http://localhost:8000/docs
- **Documentation alternative** : http://localhost:8000/redoc

## 🔧 Endpoints API

### Test et Connexion
- `GET /` - Page d'accueil
- `GET /test` - Test de connexion

### Données
- `GET /data-preview` - Aperçu des données fusionnées
- `POST /upload-csv` - Upload et fusion des fichiers CSV

### Machine Learning
- `POST /train-and-predict` - Entraînement et prédiction
- `GET /prediction-history` - Historique des prédictions
- `GET /export-predictions` - Export des prédictions en CSV

## 📦 Dépendances

- **FastAPI** : Framework web
- **Uvicorn** : Serveur ASGI
- **Pandas** : Manipulation de données
- **Scikit-learn** : Machine learning
- **XGBoost** : Modèle de boosting
- **Python-multipart** : Upload de fichiers

## 🛠️ Configuration

### Variables d'environnement
```bash
# Port du serveur (défaut: 8000)
PORT=8000

# Host (défaut: 0.0.0.0)
HOST=0.0.0.0

# Mode debug (défaut: True)
DEBUG=True
```

### Démarrage avec options personnalisées
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level info
```

## 📊 Modèles Supportés

1. **Linear Regression** (`linear_regression`)
   - Modèle simple et rapide
   - Idéal pour les tendances linéaires

2. **Random Forest** (`random_forest`)
   - Modèle robuste
   - Capture les relations non-linéaires

3. **XGBoost** (`xgboost`)
   - Modèle avancé
   - Excellentes performances

## 📁 Format des Fichiers CSV

### passengers.csv
```csv
Date,Nombre_Passagers,Train_ID,Ville_Arrivee
2024-01-01,150,TR001,Casablanca
```

### evenements.csv
```csv
Date,Type_Evenement,Impact
2024-01-15,Festival,1
```

### vacances.csv
```csv
Date_Debut,Date_Fin,Type_Vacances
2024-07-01,2024-08-31,Eté
```

## 🔍 Débogage

### Logs du serveur
```bash
uvicorn main:app --log-level debug
```

### Test des endpoints
```bash
# Test de connexion
curl http://localhost:8000/test

# Aperçu des données
curl http://localhost:8000/data-preview
```

### Documentation interactive
Ouvrez http://localhost:8000/docs pour tester les endpoints directement.

## 🚀 Déploiement

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (optionnel)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔧 Développement

### Structure du projet
```
backend/
├── main.py              # Application FastAPI
├── requirements.txt     # Dépendances Python
└── README.md           # Documentation
```

### Ajout de nouveaux endpoints
1. Modifier `main.py`
2. Ajouter la nouvelle route
3. Redémarrer le serveur (--reload activé)

### Tests
```bash
# Installer pytest
pip install pytest

# Lancer les tests
pytest
```

## 🆘 Support

### Erreurs courantes

**Port déjà utilisé**
```bash
# Changer le port
uvicorn main:app --port 8001
```

**Dépendances manquantes**
```bash
# Réinstaller les dépendances
pip install -r requirements.txt --force-reinstall
```

**Erreur CORS**
- Le CORS est déjà configuré pour accepter toutes les origines
- Vérifiez que le frontend se connecte sur le bon port

### Logs et monitoring
- Les logs sont affichés dans la console
- Utilisez `--log-level debug` pour plus de détails
- Vérifiez les erreurs dans la console du serveur

---

**Développé avec ❤️ pour ONCF** 