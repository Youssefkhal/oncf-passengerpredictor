# 🚀 Guide de Démarrage Rapide - ONCF Passenger Prediction

## 📋 Prérequis

### Système
- **Windows 10/11** ou **Linux/Mac**
- **Python 3.8+** installé
- **Node.js 16+** installé
- **npm** (inclus avec Node.js)

### Vérification des prérequis
```bash
# Vérifier Python
python --version

# Vérifier Node.js
node --version

# Vérifier npm
npm --version
```

## 🎯 Démarrage Ultra-Rapide (1 minute)

### Option 1: Script automatique (Recommandé)
```bash
# Windows
.\start_all.ps1

# Linux/Mac
./start_all.sh
```

### Option 2: Démarrage manuel
```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## 🌐 URLs d'accès

Une fois démarré, accédez à :

- **🌐 Frontend** : http://localhost:12001
- **🔧 Backend API** : http://localhost:8000
- **📚 Documentation API** : http://localhost:8000/docs

## 📱 Utilisation de l'Application

### 1. Dashboard (Page d'accueil)
- **Visualisation** des données de trafic
- **Filtres** par train et ville
- **Métriques** en temps réel
- **Graphiques** interactifs

### 2. Upload & Training
- **Glisser-déposer** les fichiers CSV
- **Sélectionner** un modèle ML
- **Configurer** le nombre de jours
- **Lancer** l'entraînement

### 3. Prédictions
- **Utiliser** des modèles pré-entraînés
- **Consulter** l'historique
- **Exporter** les résultats

## 📁 Fichiers CSV Requis

### passengers.csv
```csv
Date,Nombre_Passagers,Train_ID,Ville_Arrivee
2024-01-01,150,TR001,Casablanca
2024-01-02,180,TR001,Rabat
```

### evenements.csv
```csv
Date,Type_Evenement,Impact
2024-01-15,Festival,1
2024-02-20,Concert,1
```

### vacances.csv
```csv
Date_Debut,Date_Fin,Type_Vacances
2024-07-01,2024-08-31,Eté
2024-12-20,2025-01-05,Hiver
```

## 🔧 Scripts de Démarrage Disponibles

### Scripts Windows (.ps1)
- `start_all.ps1` - Démarre backend + frontend
- `start_backend.ps1` - Démarre uniquement le backend
- `start_frontend.ps1` - Démarre uniquement le frontend

### Scripts Linux/Mac (.sh)
- `start_all.sh` - Démarre backend + frontend
- `start_backend.sh` - Démarre uniquement le backend
- `start_frontend.sh` - Démarre uniquement le frontend

## 🛠️ Commandes Utiles

### Backend
```bash
# Démarrer le serveur
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Avec logs détaillés
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level debug

# Changer le port
uvicorn main:app --port 8001
```

### Frontend
```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

## 🔍 Débogage

### Vérifier que les serveurs fonctionnent
```bash
# Test backend
curl http://localhost:8000/test

# Test frontend
curl http://localhost:12001
```

### Logs et erreurs
- **Backend** : Vérifiez la console du terminal backend
- **Frontend** : Ouvrez les outils de développement (F12)
- **API** : Consultez http://localhost:8000/docs

### Erreurs courantes
1. **Port déjà utilisé** : Changez le port ou arrêtez le processus
2. **Dépendances manquantes** : Relancez l'installation
3. **CORS** : Vérifiez que les URLs correspondent

## 📊 Fonctionnalités Principales

### Dashboard
- ✅ Graphiques interactifs
- ✅ Filtres dynamiques
- ✅ Métriques en temps réel
- ✅ Interface responsive

### Upload & Training
- ✅ Upload drag & drop
- ✅ 3 modèles ML (Linear, Random Forest, XGBoost)
- ✅ Configuration flexible
- ✅ Résultats détaillés

### Prédictions
- ✅ Modèles pré-entraînés
- ✅ Historique complet
- ✅ Export CSV
- ✅ Statistiques avancées

## 🚀 Déploiement

### Développement
```bash
# Les serveurs redémarrent automatiquement
# Modifiez le code et sauvegardez
```

### Production
```bash
# Backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend
npm run build
# Servir les fichiers statiques
```

## 📞 Support

### Documentation
- **Frontend** : `frontend/README.md`
- **Backend** : `backend/README.md`
- **API** : http://localhost:8000/docs

### Problèmes courants
1. **Node.js manquant** : Installez depuis https://nodejs.org/
2. **Python manquant** : Installez depuis https://python.org/
3. **Ports occupés** : Utilisez des ports différents
4. **CORS** : Vérifiez les URLs dans `frontend/src/services/api.js`

---

## 🎉 Félicitations !

Votre application ONCF est maintenant opérationnelle ! 

- **Frontend** : Interface moderne et intuitive
- **Backend** : API robuste avec ML
- **Documentation** : Complète et détaillée

**Bon développement !** 🚀 