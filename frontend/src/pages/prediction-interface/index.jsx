import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';
import { 
  Brain, 
  TrendingUp, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Target,
  LineChart,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { apiService, handleApiError, downloadFile } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';

const PredictPage = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [daysToPredict, setDaysToPredict] = useState(30);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const modelOptions = [
    { value: 'Linear Regression', label: 'Régression Linéaire' },
    { value: 'Random Forest', label: 'Random Forest' },
    { value: 'XGBoost', label: 'XGBoost' }
  ];

  useEffect(() => {
    loadPredictionHistory();
  }, []);

  const loadPredictionHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPredictionHistory();
      setPredictionHistory(response.history || []);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
      setPredictionHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedModel) {
      setPredictionError('Veuillez sélectionner un modèle');
      return;
    }

    if (!daysToPredict || daysToPredict < 1) {
      setPredictionError('Veuillez spécifier un nombre de jours valide');
      return;
    }

    try {
      setPredicting(true);
      setPredictionError(null);
      
      const result = await apiService.trainAndPredict(selectedModel, daysToPredict);
      setPredictionResult(result);
      setPredictionError(null);
      
      // Recharger l'historique
      await loadPredictionHistory();
    } catch (err) {
      setPredictionError(handleApiError(err));
    } finally {
      setPredicting(false);
    }
  };

  const handleExportPredictions = async () => {
    if (!predictionResult) return;
    
    try {
      const blob = await apiService.exportPredictions();
      const filename = `predictions_${selectedModel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(blob, filename);
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      alert(`Erreur lors de l'export: ${handleApiError(err)}`);
    }
  };

  const getModelPerformanceColor = (r2) => {
    if (r2 >= 0.8) return 'text-green-600';
    if (r2 >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'training':
        return 'En cours';
      case 'failed':
        return 'Échoué';
      default:
        return 'Inconnu';
    }
  };

  const getPredictionChartData = () => {
    if (!predictionResult?.predictions) return null;

    // Grouper les prédictions par date et calculer la moyenne des passagers
    const predictionsByDate = {};
    predictionResult.predictions.forEach(pred => {
      if (!predictionsByDate[pred.date]) {
        predictionsByDate[pred.date] = {
          total_passengers: 0,
          count: 0,
          has_event: pred.event_present === 1,
          has_vacation: pred.vacance_present === 1,
          event_name: pred.event_name || "",
          vacance_name: pred.vacance_name || "",
          vacance_duration: pred.vacance_duration || 0
        };
      }
      predictionsByDate[pred.date].total_passengers += pred.predicted_passengers;
      predictionsByDate[pred.date].count += 1;
      // Garder les informations d'événement/vacance de la première prédiction de la journée
      if (pred.event_name && !predictionsByDate[pred.date].event_name) {
        predictionsByDate[pred.date].event_name = pred.event_name;
      }
      if (pred.vacance_name && !predictionsByDate[pred.date].vacance_name) {
        predictionsByDate[pred.date].vacance_name = pred.vacance_name;
        predictionsByDate[pred.date].vacance_duration = pred.vacance_duration;
      }
    });

    // Stocker les données pour les tooltips
    window.predictionChartData = predictionsByDate;

    // Calculer la moyenne et préparer les données pour le graphique
    const sortedDates = Object.keys(predictionsByDate).sort();
    const labels = sortedDates.map(date => {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Prédiction passagers (moyenne)',
          data: sortedDates.map(date => Math.round(predictionsByDate[date].total_passengers / predictionsByDate[date].count)),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Jours avec événements',
          data: sortedDates.map(date => 
            predictionsByDate[date].has_event ? 
            Math.round(predictionsByDate[date].total_passengers / predictionsByDate[date].count) : null
          ),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointRadius: 6,
          showLine: false,
        },
        {
          label: 'Jours de vacances',
          data: sortedDates.map(date => 
            predictionsByDate[date].has_vacation ? 
            Math.round(predictionsByDate[date].total_passengers / predictionsByDate[date].count) : null
          ),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointRadius: 6,
          showLine: false,
        }
      ]
    };

    return chartData;
  };

  const predictionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Prédictions de trafic passagers ONCF',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            const dataIndex = context.dataIndex;
            const predictionsByDate = window.predictionChartData;
            if (!predictionsByDate) return context.dataset.label + ': ' + context.parsed.y;
            
            const sortedDates = Object.keys(predictionsByDate).sort();
            const date = sortedDates[dataIndex];
            const dateData = predictionsByDate[date];
            
            // Pour les événements et vacances, afficher le nom au lieu de la valeur
            if (context.dataset.label === 'Jours avec événements' && dateData?.has_event && dateData?.event_name) {
              return `Jours avec événements: ${dateData.event_name}`;
            }
            
            if (context.dataset.label === 'Jours de vacances' && dateData?.has_vacation && dateData?.vacance_name) {
              return `Jours de vacances: ${dateData.vacance_name}`;
            }
            
            // Pour les autres datasets, afficher la valeur normale
            return context.dataset.label + ': ' + context.parsed.y;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Nombre de passagers prédit'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interface de Prédiction</h1>
        <p className="text-muted-foreground">
          Utilisez des modèles déjà entraînés pour générer de nouvelles prédictions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Configuration */}
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold">Configuration de la Prédiction</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Modèle à utiliser
                </label>
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre de jours à prédire
                </label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={daysToPredict}
                  onChange={(e) => setDaysToPredict(parseInt(e.target.value) || 30)}
                  placeholder="30"
                />
              </div>

              <Button
                onClick={handlePredict}
                disabled={predicting || !selectedModel}
                className="w-full"
              >
                {predicting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Prédiction en cours...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Lancer la prédiction
                  </>
                )}
              </Button>

              {predictionError && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive text-sm">{predictionError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Résultats de la prédiction */}
          {predictionResult && (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold">Résultats de la prédiction</h3>
              </div>

              {/* Performance */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">R² Score</span>
                  </div>
                  <p className={`text-xl font-bold ${getModelPerformanceColor(predictionResult.model_performance?.r2)}`}>
                    {(predictionResult.model_performance?.r2 * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">MSE</span>
                  </div>
                  <p className="text-xl font-bold">
                    {predictionResult.model_performance?.mse?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Graphique des prédictions */}
              {predictionResult.predictions && predictionResult.predictions.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Graphique des prédictions</h4>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={chartType === 'line' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChartType('line')}
                      >
                        <LineChart className="h-4 w-4 mr-1" />
                        Ligne
                      </Button>
                      <Button
                        variant={chartType === 'bar' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChartType('bar')}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Barres
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFullscreen}
                      >
                        {isFullscreen ? (
                          <>
                            <Minimize2 className="h-4 w-4 mr-1" />
                            Réduire
                          </>
                        ) : (
                          <>
                            <Maximize2 className="h-4 w-4 mr-1" />
                            Plein écran
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`bg-muted/20 rounded-lg p-4 ${isFullscreen ? 'h-screen' : 'h-64'}`}>
                    {getPredictionChartData() ? (
                      chartType === 'line' ? (
                        <Line data={getPredictionChartData()} options={predictionChartOptions} />
                      ) : (
                        <Bar data={getPredictionChartData()} options={predictionChartOptions} />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Aucune donnée de prédiction à afficher</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prédictions */}
              {predictionResult.predictions && predictionResult.predictions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Prédictions générées</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPredictions}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exporter CSV
                    </Button>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3 max-h-60 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Date</th>
                          <th className="text-left py-2">Train ID</th>
                          <th className="text-left py-2">Ville</th>
                          <th className="text-left py-2">Passagers</th>
                          <th className="text-left py-2">Événement</th>
                          <th className="text-left py-2">Vacance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictionResult.predictions.slice(0, 10).map((pred, index) => (
                          <tr key={index} className="border-b border-border/50">
                            <td className="py-2">{pred.date}</td>
                            <td className="py-2">{pred.train_id}</td>
                            <td className="py-2">{pred.ville_arrivee}</td>
                            <td className="py-2 font-medium">
                              {Math.round(pred.predicted_passengers).toLocaleString()}
                            </td>
                            <td className="py-2">
                              {pred.event_present === 1 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  {pred.event_name || "Événement"}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </td>
                            <td className="py-2">
                              {pred.vacance_present === 1 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {pred.vacance_name || "Vacance"}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {predictionResult.predictions.length > 10 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Affichage des 10 premières prédictions sur {predictionResult.predictions.length}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section Historique */}
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Historique des Prédictions</h2>
            </div>

            {predictionHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune prédiction dans l'historique</p>
                  <p className="text-sm">Effectuez votre première prédiction pour commencer</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {predictionHistory.map((prediction) => (
                  <div key={prediction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{prediction.model_type}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prediction.status)}`}>
                        {getStatusText(prediction.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Jours prédits:</span>
                        <span className="ml-2 font-medium">{prediction.days_predicted}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prédictions:</span>
                        <span className="ml-2 font-medium">{prediction.predictions_count}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">R² Score:</span>
                        <span className={`ml-2 font-medium ${getModelPerformanceColor(prediction.model_performance?.r2)}`}>
                          {(prediction.model_performance?.r2 * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">MSE:</span>
                        <span className="ml-2 font-medium">{prediction.model_performance?.mse?.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Créé le {new Date(prediction.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictPage; 