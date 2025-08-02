import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import GlobalHeader from '../../components/ui/GlobalHeader';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import LoadingStateManager from '../../components/ui/LoadingStateManager';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { formatNumber, formatDate, formatPercentage } from '../../utils/formatters';

const ModelTrainingCenter = () => {
  const { 
    loading, 
    error, 
    predictions, 
    predictionHistory, 
    trainAndPredictModel, 
    loadPredictionHistory,
    clearError 
  } = useData();

  const [selectedModel, setSelectedModel] = useState('');
  const [trainingConfig, setTrainingConfig] = useState({
    testSize: 0.2,
    randomState: 42,
    maxIterations: 1000
  });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelMetrics, setModelMetrics] = useState(null);

  const modelOptions = [
    { value: 'Linear Regression', label: 'Régression Linéaire' },
    { value: 'Random Forest', label: 'Forêt Aléatoire' },
    { value: 'XGBoost', label: 'XGBoost' }
  ];

  const modelConfigs = {
    'Linear Regression': {
      name: 'Régression Linéaire',
      description: 'Modèle linéaire simple et rapide',
      pros: ['Rapide à entraîner', 'Interprétable', 'Stable'],
      cons: ['Limité aux relations linéaires', 'Performance modérée'],
      parameters: [
        { name: 'fit_intercept', label: 'Intercept', type: 'boolean', default: true },
        { name: 'normalize', label: 'Normalisation', type: 'boolean', default: false }
      ]
    },
    'Random Forest': {
      name: 'Forêt Aléatoire',
      description: 'Ensemble d\'arbres de décision',
      pros: ['Robuste', 'Capture les non-linéarités', 'Résistant au surapprentissage'],
      cons: ['Plus lent', 'Moins interprétable'],
      parameters: [
        { name: 'n_estimators', label: 'Nombre d\'arbres', type: 'number', default: 100, min: 10, max: 1000 },
        { name: 'max_depth', label: 'Profondeur max', type: 'number', default: 10, min: 1, max: 50 }
      ]
    },
    'XGBoost': {
      name: 'XGBoost',
      description: 'Gradient boosting optimisé',
      pros: ['Excellentes performances', 'Gestion des valeurs manquantes', 'Régularisation intégrée'],
      cons: ['Plus complexe', 'Temps d\'entraînement long'],
      parameters: [
        { name: 'n_estimators', label: 'Nombre d\'estimateurs', type: 'number', default: 100, min: 10, max: 1000 },
        { name: 'learning_rate', label: 'Taux d\'apprentissage', type: 'number', default: 0.1, min: 0.01, max: 1, step: 0.01 }
      ]
    }
  };

  useEffect(() => {
    loadPredictionHistory();
  }, [loadPredictionHistory]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setTrainingProgress(0);
    }
  }, [loading]);

  const handleTrainModel = async () => {
    if (!selectedModel || !modelConfig) {
      return;
    }

    try {
      const result = await trainAndPredictModel(selectedModel, 7); // Default to 7 days for training
      
      // Update model metrics with real data from backend
      if (result && result.model_performance) {
        setModelMetrics({
          r2: result.model_performance.r2,
          mse: result.model_performance.mse,
          accuracy: result.model_performance.accuracy || result.model_performance.r2
        });
      }
    } catch (error) {
      console.error('Training error:', error);
    }
  };

  const handleExportModel = () => {
    if (!modelMetrics) {
      alert('Aucun modèle entraîné à exporter');
      return;
    }

    try {
      // Create model report
      const reportContent = [
        ['Modèle', selectedModel],
        ['Date d\'entraînement', new Date().toISOString().split('T')[0]],
        ['Performance (R²)', modelMetrics.r2 ? (modelMetrics.r2 * 100).toFixed(2) + '%' : 'N/A'],
        ['Erreur quadratique moyenne', modelMetrics.mse ? modelMetrics.mse.toFixed(2) : 'N/A'],
        ['', ''],
        ['Configuration du modèle', ''],
        ...Object.entries(modelConfig).map(([key, value]) => [key, value])
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([reportContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `modele_${selectedModel}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const handleViewDetails = () => {
    if (!modelMetrics) {
      alert('Aucun modèle entraîné à afficher');
      return;
    }

    alert(`Détails du modèle ${selectedModel}:\n` +
          `Performance (R²): ${modelMetrics.r2 ? (modelMetrics.r2 * 100).toFixed(2) + '%' : 'N/A'}\n` +
          `Erreur quadratique moyenne: ${modelMetrics.mse ? modelMetrics.mse.toFixed(2) : 'N/A'}\n` +
          `Configuration: ${JSON.stringify(modelConfig, null, 2)}`);
  };

  const currentModelConfig = modelConfigs[selectedModel];

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BreadcrumbNavigation />
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Centre d'Entraînement des Modèles
            </h1>
            <p className="text-muted-foreground">
              Configurez, entraînez et optimisez vos modèles de prédiction
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
                <span className="text-destructive font-medium">Erreur:</span>
                <span className="text-destructive">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Model Selection and Configuration */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Sélection du Modèle
                </h2>
                
                <Select
                  label="Modèle"
                  options={modelOptions}
                  value={selectedModel}
                  onChange={setSelectedModel}
                  placeholder="Choisir un modèle"
                  required={true}
                />

                {currentModelConfig && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">
                        {currentModelConfig.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {currentModelConfig.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Avantages</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {currentModelConfig.pros.map((pro, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <Icon name="Check" size={14} className="text-success" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Limitations</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {currentModelConfig.cons.map((con, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <Icon name="AlertCircle" size={14} className="text-warning" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Training Configuration */}
              {selectedModel && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Configuration d'Entraînement
                  </h3>
                  
                  <div className="space-y-4">
                    <Input
                      type="number"
                      label="Taille du Test (%)"
                      value={trainingConfig.testSize * 100}
                      onChange={(e) => setTrainingConfig(prev => ({
                        ...prev,
                        testSize: parseInt(e.target.value) / 100
                      }))}
                      min={10}
                      max={50}
                      step={5}
                      description="Pourcentage de données pour la validation"
                    />

                    <Input
                      type="number"
                      label="État Aléatoire"
                      value={trainingConfig.randomState}
                      onChange={(e) => setTrainingConfig(prev => ({
                        ...prev,
                        randomState: parseInt(e.target.value)
                      }))}
                      description="Pour la reproductibilité des résultats"
                    />

                    <Input
                      type="number"
                      label="Itérations Maximales"
                      value={trainingConfig.maxIterations}
                      onChange={(e) => setTrainingConfig(prev => ({
                        ...prev,
                        maxIterations: parseInt(e.target.value)
                      }))}
                      min={100}
                      max={10000}
                      step={100}
                      description="Nombre maximum d'itérations d'entraînement"
                    />

                    <Button
                      onClick={handleTrainModel}
                      disabled={!selectedModel || loading}
                      loading={loading}
                      size="lg"
                      leftIcon="Play"
                      fullWidth
                    >
                      Entraîner le Modèle
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Training Progress and Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Training Status */}
              {loading && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Entraînement en Cours
                  </h3>
                  <LoadingStateManager
                    type="model-training"
                    message={`Entraînement du modèle ${currentModelConfig?.name || selectedModel}...`}
                    progress={trainingProgress}
                    estimatedTime="3-5 minutes"
                  />
                </div>
              )}

              {/* Model Performance Metrics */}
              {modelMetrics && !loading && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Métriques de Performance
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatPercentage(modelMetrics.accuracy)}
                      </div>
                      <div className="text-sm text-muted-foreground">Précision</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-accent">
                        {formatNumber(Math.round(modelMetrics.mse))}
                      </div>
                      <div className="text-sm text-muted-foreground">MSE</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-success">
                        {formatNumber(Math.round(modelMetrics.mae))}
                      </div>
                      <div className="text-sm text-muted-foreground">MAE</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-warning">
                        {formatPercentage(modelMetrics.r2)}
                      </div>
                      <div className="text-sm text-muted-foreground">R²</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon="Download"
                      fullWidth
                      onClick={handleExportModel}
                    >
                      Exporter le Modèle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon="BarChart3"
                      fullWidth
                      onClick={handleViewDetails}
                    >
                      Voir les Détails
                    </Button>
                  </div>
                </div>
              )}

              {/* Model Comparison */}
              {predictionHistory && predictionHistory.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Comparaison des Modèles
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Modèle</th>
                          <th className="px-4 py-2 text-left">Performance</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {predictionHistory.slice(0, 10).map((prediction, index) => (
                          <tr key={index} className="hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium text-foreground">
                              {prediction.model_type}
                            </td>
                            <td className="px-4 py-3">
                              {prediction.performance ? formatPercentage(prediction.performance) : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {formatDate(prediction.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                prediction.status === 'completed' 
                                  ? 'bg-success/10 text-success' 
                                  : 'bg-warning/10 text-warning'
                              }`}>
                                {prediction.status === 'completed' ? 'Terminé' : 'En cours'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Training History */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Historique d'Entraînement
                </h3>
                
                <div className="space-y-3">
                  {predictionHistory && predictionHistory.length > 0 ? (
                    predictionHistory.slice(0, 5).map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            prediction.status === 'completed' ? 'bg-success' : 'bg-warning'
                          }`} />
                          <div>
                            <div className="font-medium text-foreground">
                              {prediction.model_type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(prediction.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-foreground">
                            {prediction.performance ? formatPercentage(prediction.performance) : 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {prediction.status === 'completed' ? 'Terminé' : 'En cours'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="History" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Aucun historique d'entraînement disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModelTrainingCenter; 