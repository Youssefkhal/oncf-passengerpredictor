import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteurs pour la gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Endpoints API
export const apiService = {
  // Test de connexion
  testConnection: async () => {
    const response = await api.get('/test');
    return response.data;
  },

  // Récupération des données de prévisualisation
  getDataPreview: async () => {
    const response = await api.get('/data-preview');
    return response.data;
  },

  // Récupération des événements et vacances futurs
  getFutureEvents: async () => {
    const response = await api.get('/future-events');
    return response.data;
  },

  // Upload des fichiers CSV
  uploadCSV: async (passengersFile, evenementsFile, vacancesFile) => {
    const formData = new FormData();
    formData.append('passengers_file', passengersFile);
    formData.append('evenements_file', evenementsFile);
    formData.append('vacances_file', vacancesFile);

    const response = await api.post('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload individuel des fichiers
  uploadPassengers: async (passengersFile) => {
    const formData = new FormData();
    formData.append('passengers_file', passengersFile);

    const response = await api.post('/upload-passengers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadEvents: async (evenementsFile) => {
    const formData = new FormData();
    formData.append('evenements_file', evenementsFile);

    const response = await api.post('/upload-events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadHolidays: async (vacancesFile) => {
    const formData = new FormData();
    formData.append('vacances_file', vacancesFile);

    const response = await api.post('/upload-holidays', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Entraînement et prédiction
  trainAndPredict: async (modelType, daysToPredict) => {
    const response = await api.post('/train-and-predict', {
      model_type: modelType,
      days_to_predict: daysToPredict,
    });
    return response.data;
  },

  // Récupération de l'historique des prédictions
  getPredictionHistory: async () => {
    const response = await api.get('/prediction-history');
    return response.data;
  },

  // Export des prédictions
  exportPredictions: async () => {
    const response = await api.get('/export-predictions', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Supprimer une ligne
  deleteRow: async ({ index, date, train_id, ville_arrivee }) => {
    const params = {};
    if (index !== undefined && index !== null) params.index = index;
    if (date) params.date = date;
    if (train_id) params.train_id = train_id;
    if (ville_arrivee) params.ville_arrivee = ville_arrivee;
    const response = await api.delete('/delete-row', { params });
    return response.data;
  },

  // Modifier une ligne
  editRow: async ({ index, date, train_id, ville_arrivee, update_fields }) => {
    const body = { update_fields };
    if (index !== undefined && index !== null) body.index = index;
    if (date) body.date = date;
    if (train_id) body.train_id = train_id;
    if (ville_arrivee) body.ville_arrivee = ville_arrivee;
    const response = await api.put('/edit-row', body);
    return response.data;
  },

  // Réinitialiser les données
  resetData: async () => {
    const response = await api.post('/reset-data');
    return response.data;
  },
};

// Utilitaires pour la gestion des erreurs
export const handleApiError = (error) => {
  if (error.response) {
    // Erreur de réponse du serveur
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return `Erreur de validation: ${data.detail || 'Données invalides'}`;
      case 404:
        return 'Ressource non trouvée';
      case 500:
        return 'Erreur interne du serveur';
      default:
        return `Erreur ${status}: ${data.detail || 'Erreur inconnue'}`;
    }
  } else if (error.request) {
    // Erreur de réseau
    return 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.';
  } else {
    // Autre erreur
    return 'Une erreur inattendue s\'est produite';
  }
};

// Utilitaires pour la gestion des fichiers
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default apiService; 