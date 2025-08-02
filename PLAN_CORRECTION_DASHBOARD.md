# Plan de Correction du Dashboard ONCF

## Problèmes Identifiés

### 1. ✅ Format CSV des Événements
- **Status**: RÉSOLU
- **Problème**: Le fichier CSV avait des colonnes avec accents
- **Solution**: Le fichier a été corrigé avec le format: `Date,Evenement_Present,Description_Evenement`

### 2. ✅ Analyse des Erreurs de Connexion
- **Status**: IDENTIFIÉ
- **Problème**: Incohérence des ports entre les composants frontend
- **Détails**:
  - Backend configuré sur port **8000** ✅
  - Frontend sur port **12001** ✅
  - Service API principal (`api.js`) utilise port **8000** ✅
  - **PROBLÈME**: Certains composants utilisent port **12000** ❌

### 3. 🔧 Corrections Nécessaires

#### A. Corriger les Ports Frontend
Fichiers à corriger (changer `localhost:12000` → `localhost:8000`):

1. **oncf--main/frontend/src/components/DashboardPage.jsx**
   - Ligne 5: `const API_BASE_URL = 'http://localhost:12000'`
   - Corriger en: `const API_BASE_URL = 'http://localhost:8000'`

2. **oncf--main/frontend/src/components/UploadPage.jsx**
   - Ligne 4: `const API_BASE_URL = 'http://localhost:12000'`
   - Corriger en: `const API_BASE_URL = 'http://localhost:8000'`

3. **oncf--main/frontend/src/components/ModelPage.jsx**
   - Ligne 30: `const API_BASE_URL = 'http://localhost:12000'`
   - Corriger en: `const API_BASE_URL = 'http://localhost:8000'`

#### B. Améliorer le Mapping des Colonnes Backend
Le backend doit mieux gérer les variations de noms de colonnes avec/sans accents:

**Fichier**: `oncf--main/backend/main.py`

**Améliorations nécessaires**:
1. Fonction de normalisation des noms de colonnes plus robuste
2. Gestion des accents dans les noms de colonnes
3. Mapping automatique des variations courantes

#### C. Vérifications de Cohérence
1. S'assurer que tous les composants utilisent le même port
2. Tester la connexion backend/frontend
3. Valider l'affichage des données d'événements

## Plan d'Implémentation

### Phase 1: Corrections des Ports (Mode Code)
- [ ] Corriger DashboardPage.jsx
- [ ] Corriger UploadPage.jsx  
- [ ] Corriger ModelPage.jsx

### Phase 2: Amélioration Backend (Mode Code)
- [ ] Améliorer la fonction de normalisation des colonnes
- [ ] Ajouter la gestion des accents
- [ ] Tester le chargement des données d'exemple

### Phase 3: Tests et Validation
- [ ] Démarrer le backend
- [ ] Démarrer le frontend
- [ ] Tester l'affichage du dashboard
- [ ] Valider les données d'événements

## Configuration Finale Attendue

```
Backend:  http://localhost:8000
Frontend: http://localhost:12001
API Calls: Tous vers http://localhost:8000
```

## Fichiers CSV Attendus

### evenements.csv
```
Date,Evenement_Present,Description_Evenement
2024-01-01,1,Nouvel An
2024-01-02,0,
...
```

### Structure Backend
- Port: 8000
- Gestion robuste des noms de colonnes
- Support des accents dans les CSV

## Prochaines Étapes

1. **Passer en mode Code** pour effectuer les corrections
2. **Corriger les ports** dans les 3 composants frontend
3. **Améliorer le backend** pour une meilleure gestion des colonnes
4. **Tester** l'application complète
5. **Valider** l'affichage du dashboard avec les données d'événements