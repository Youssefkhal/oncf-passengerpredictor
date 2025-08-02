# 🔧 Guide de Résolution des Problèmes - ONCF Dashboard

## 🚨 Problèmes Courants et Solutions

### 1. **"Erreur interne du serveur" lors de l'upload**

#### 🔍 **Diagnostic :**
- Vérifiez que le backend est démarré sur le port 8000
- Vérifiez le format des fichiers CSV

#### ✅ **Solutions :**

**A. Redémarrer le backend :**
```bash
# Arrêter le backend (Ctrl+C)
# Puis redémarrer :
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**B. Vérifier le format des fichiers CSV :**

**passengers.csv :**
```csv
Date,Train_ID,Ville_Arrivée,Nombre_Passagers
2024-01-01,T001,Casablanca,150
2024-01-01,T002,Fès,120
```

**evenements.csv :**
```csv
Date,Événement_Présent,Description_Événement
2024-01-01,1,Nouvel An
2024-01-02,0,
```

**vacances.csv :**
```csv
Date,Vacance
2024-01-01,1
2024-01-02,0
```

### 2. **"Les données ne sont pas visibles sur le dashboard"**

#### 🔍 **Diagnostic :**
- Les données ne sont pas chargées dans le backend
- Problème de connexion entre frontend et backend

#### ✅ **Solutions :**

**A. Utiliser les données d'exemple :**
Le backend charge automatiquement les données d'exemple au démarrage.

**B. Vérifier la connexion :**
```bash
# Test de l'API
curl http://localhost:8000/test
curl http://localhost:8000/data-preview
```

**C. Redémarrer les deux serveurs :**
```bash
# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (nouveau terminal)
cd frontend
npm run dev
```

### 3. **"Missing script: dev"**

#### ✅ **Solution :**
```bash
# Aller dans le bon dossier
cd frontend
npm run dev
```

### 4. **"Could not import module 'main'"**

#### ✅ **Solution :**
```bash
# Aller dans le bon dossier
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🧪 **Scripts de Diagnostic**

### **Test Automatique de l'API :**
```bash
# PowerShell
.\test_api.ps1

# Python
python test_api.py
```

### **Vérification des Ports :**
```bash
# Vérifier que les ports sont utilisés
netstat -an | findstr :8000
netstat -an | findstr :12001
```

## 📋 **Checklist de Démarrage**

### ✅ **Prérequis :**
- [ ] Python 3.8+ installé
- [ ] Node.js 16+ installé
- [ ] npm installé

### ✅ **Démarrage :**
1. [ ] Ouvrir un terminal dans le dossier racine
2. [ ] Démarrer le backend : `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
3. [ ] Ouvrir un nouveau terminal
4. [ ] Démarrer le frontend : `cd frontend && npm run dev`
5. [ ] Ouvrir http://localhost:12001

### ✅ **Vérification :**
1. [ ] Backend accessible sur http://localhost:8000
2. [ ] Frontend accessible sur http://localhost:12001
3. [ ] Dashboard affiche les données
4. [ ] Upload fonctionne
5. [ ] Prédictions fonctionnent

## 🔄 **Redémarrage Complet**

Si rien ne fonctionne, suivez ces étapes :

1. **Arrêter tous les processus :**
   - Ctrl+C dans tous les terminaux

2. **Nettoyer les caches :**
   ```bash
   # Frontend
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   
   # Backend
   cd backend
   pip install -r requirements.txt
   ```

3. **Redémarrer dans l'ordre :**
   ```bash
   # 1. Backend
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   
   # 2. Frontend (nouveau terminal)
   cd frontend
   npm run dev
   ```

## 📞 **Support**

Si les problèmes persistent :

1. **Vérifiez les logs :**
   - Regardez les messages dans les terminaux
   - Vérifiez les erreurs dans la console du navigateur (F12)

2. **Testez l'API directement :**
   ```bash
   curl http://localhost:8000/test
   curl http://localhost:8000/data-preview
   ```

3. **Utilisez les scripts automatiques :**
   ```bash
   # Windows
   .\start_all.ps1
   
   # Linux/Mac
   ./start_servers.sh
   ```

## 🎯 **URLs Importantes**

- **🌐 Frontend** : http://localhost:12001
- **🔧 Backend API** : http://localhost:8000
- **📚 Documentation API** : http://localhost:8000/docs
- **🧪 Test API** : http://localhost:8000/test 