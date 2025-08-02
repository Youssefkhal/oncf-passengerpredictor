# ONCF Passenger Prediction Frontend

Un frontend moderne et complet pour l'API de prédiction de passagers ONCF, développé avec React, TailwindCSS et Chart.js.

## 🚀 Fonctionnalités

### 📊 Dashboard (Visualisation)
- **Graphiques interactifs** : Visualisation du trafic journalier avec Chart.js
- **Filtres dynamiques** : Par Train_ID et Ville_Arrivée
- **Métriques en temps réel** : Nombre total de records, jours avec événements, jours de vacances
- **Graphiques en ligne et en barres** : Basculement entre les types de visualisation
- **Données fusionnées** : Affichage des données issues de l'endpoint `/data-preview`

### 📁 Upload & Training
- **Upload de fichiers CSV** : Drag & drop pour passengers.csv, evenements.csv, vacances.csv
- **Fusion automatique** : Validation et fusion des données via `/upload-csv`
- **Sélection de modèles** : Linear Regression, Random Forest, XGBoost
- **Configuration flexible** : Nombre de jours à prédire personnalisable
- **Résultats détaillés** : Performance (R², MSE) et aperçu des prédictions
- **Export CSV** : Téléchargement des résultats de prédiction

### 🔮 Interface de Prédiction
- **Modèles pré-entraînés** : Utilisation de modèles déjà entraînés
- **Historique complet** : Visualisation de toutes les prédictions passées
- **Statistiques avancées** : Métriques de performance et statistiques d'usage
- **Export des résultats** : Téléchargement des prédictions en CSV

## 🛠️ Technologies Utilisées

- **React 18** : Framework principal
- **TailwindCSS** : Framework CSS utilitaire
- **Chart.js** : Bibliothèque de graphiques
- **React Router** : Navigation entre les pages
- **Axios** : Client HTTP pour les appels API
- **Lucide React** : Icônes modernes
- **Radix UI** : Composants UI accessibles
- **React Dropzone** : Upload de fichiers avec drag & drop

## 📦 Installation

1. **Cloner le projet** :
```bash
git clone <repository-url>
cd oncf--main/frontend
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Démarrer le serveur de développement** :
```bash
npm run dev
```

4. **Ouvrir dans le navigateur** :
```
http://localhost:12001
```

## 🔧 Configuration

### Variables d'environnement
Le frontend se connecte par défaut à l'API backend sur `http://localhost:8000`. Pour modifier l'URL de l'API, éditez le fichier `src/services/api.js` :

```javascript
const API_BASE_URL = 'http://localhost:8000'; // Modifier selon votre configuration
```

### Port de développement
Le frontend démarre par défaut sur le port 12001. Pour modifier le port, éditez le script dans `package.json` :

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 12001"
  }
}
```

## 📱 Utilisation

### 1. Dashboard
- **Accès** : Page d'accueil (`/`)
- **Fonctionnalités** :
  - Visualisation des données de trafic
  - Filtrage par train et ville
  - Basculement entre graphiques ligne/barres
  - Métriques en temps réel

### 2. Upload & Training
- **Accès** : `/upload-train`
- **Étapes** :
  1. Glisser-déposer les fichiers CSV (passengers, evenements, vacances)
  2. Cliquer sur "Valider et fusionner"
  3. Sélectionner le type de modèle
  4. Définir le nombre de jours à prédire
  5. Lancer l'entraînement et la prédiction
  6. Exporter les résultats si nécessaire

### 3. Prédictions
- **Accès** : `/predict`
- **Fonctionnalités** :
  - Sélection d'un modèle pré-entraîné
  - Génération de nouvelles prédictions
  - Consultation de l'historique
  - Export des résultats

## 🎨 Design System

### Couleurs
- **Primary** : Bleu (#3B82F6)
- **Success** : Vert (#10B981)
- **Warning** : Jaune (#F59E0B)
- **Error** : Rouge (#EF4444)

### Composants
- **Cards** : Conteneurs avec bordures et ombres
- **Buttons** : Boutons avec états hover et focus
- **Inputs** : Champs de saisie avec validation
- **Selects** : Menus déroulants accessibles
- **Tables** : Tableaux responsifs avec tri

## 📊 API Endpoints Utilisés

- `GET /test` : Test de connexion
- `GET /data-preview` : Récupération des données de prévisualisation
- `POST /upload-csv` : Upload et fusion des fichiers CSV
- `POST /train-and-predict` : Entraînement et prédiction
- `GET /prediction-history` : Historique des prédictions
- `GET /export-predictions` : Export des prédictions en CSV

## 🔍 Débogage

### Console du navigateur
Les erreurs API et les logs sont affichés dans la console du navigateur (F12).

### Network Tab
Vérifiez les appels API dans l'onglet Network des outils de développement.

### Erreurs courantes
- **Erreur de connexion** : Vérifiez que le backend est démarré sur le bon port
- **Erreur CORS** : Vérifiez la configuration CORS du backend
- **Erreur de fichiers** : Vérifiez le format et la taille des fichiers CSV

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Serveur de prévisualisation
```bash
npm run preview
```

### Variables d'environnement de production
Créez un fichier `.env.production` pour configurer l'URL de l'API en production :

```env
VITE_API_URL=https://your-api-domain.com
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les issues existantes
3. Créez une nouvelle issue avec les détails du problème

---

**Développé avec ❤️ pour ONCF** 