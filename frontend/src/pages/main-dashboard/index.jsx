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
  BarChart3, 
  LineChart, 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp,
  AlertCircle,
  Sun,
  CalendarDays,
  Clock,
  Star
} from 'lucide-react';
import { apiService, handleApiError } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { cn } from '../../utils/cn';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [selectedTrainId, setSelectedTrainId] = useState('all');
  const [selectedVille, setSelectedVille] = useState('all');
  const [filteredData, setFilteredData] = useState(null);
  const [futureEvents, setFutureEvents] = useState({ future_events: [], future_holidays: [] });

  // États pour les métriques
  const [metrics, setMetrics] = useState({
    totalRecords: 0,
    eventDays: 0,
    vacationDays: 0,
    dateRange: { start: null, end: null }
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (data) {
      applyFilters();
      calculateMetrics();
    }
  }, [data, selectedTrainId, selectedVille]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDataPreview();
      setData(response);
      
      // Charger aussi les événements futurs
      try {
        const futureEventsResponse = await apiService.getFutureEvents();
        setFutureEvents(futureEventsResponse);
      } catch (err) {
        console.warn('Impossible de charger les événements futurs:', err);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!data?.merged_data) return;

    let filtered = [...data.merged_data];

    if (selectedTrainId !== 'all') {
      filtered = filtered.filter(item => item.Train_ID === selectedTrainId);
    }

    if (selectedVille !== 'all') {
      filtered = filtered.filter(item => item.Ville_Arrivee === selectedVille);
    }

    // Trier par date
    filtered.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    setFilteredData(filtered);
  };

  const calculateMetrics = () => {
    if (!data?.merged_data) return;
    
    const records = data.merged_data;
    const eventDays = records.filter(item => item.Evenement_Present === 1).length;
    const vacationDays = records.filter(item => item.Vacance === 1).length;
    
    const dates = records.map(item => new Date(item.Date)).sort((a, b) => a - b);
    
    setMetrics({
      totalRecords: records.length,
      eventDays,
      vacationDays,
      dateRange: {
        start: dates[0],
        end: dates[dates.length - 1]
      }
    });
  };

  const getChartData = () => {
    if (!filteredData) return null;

    // Grouper les données par date et calculer les informations nécessaires
    const dataByDate = {};
    filteredData.forEach(item => {
      if (!dataByDate[item.Date]) {
        dataByDate[item.Date] = {
          total_passengers: 0,
          count: 0,
          has_event: item.Evenement_Present === 1,
          has_vacation: item.Vacance === 1,
          event_name: item.Description_Evenement || "",
          vacance_name: item.Titre_Vacances || "",
          passengers: item.Nombre_Passagers
        };
      }
      dataByDate[item.Date].total_passengers += item.Nombre_Passagers;
      dataByDate[item.Date].count += 1;
      // Garder les informations d'événement/vacance
      if (item.Description_Evenement && !dataByDate[item.Date].event_name) {
        dataByDate[item.Date].event_name = item.Description_Evenement;
      }
      if (item.Titre_Vacances && !dataByDate[item.Date].vacance_name) {
        dataByDate[item.Date].vacance_name = item.Titre_Vacances;
      }
    });

    // Stocker les données pour les tooltips
    window.dashboardChartData = dataByDate;

    // Adapter l'affichage des dates au format DD/MM/YYYY
    const labels = filteredData.map(item => {
      if (item.Date && item.Date.includes('-')) {
        const [year, month, day] = item.Date.split('-');
        return `${day}/${month}/${year}`;
      }
      return item.Date;
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Prédiction passagers (moyenne)',
          data: filteredData.map(item => item.Nombre_Passagers),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Jours avec événements',
          data: filteredData.map(item => item.Evenement_Present === 1 ? item.Nombre_Passagers : null),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointRadius: 6,
          showLine: false,
        },
        {
          label: 'Jours de vacances',
          data: filteredData.map(item => item.Vacance === 1 ? item.Nombre_Passagers : null),
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

  const chartOptions = {
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
            const dataByDate = window.dashboardChartData;
            if (!dataByDate) return context.dataset.label + ': ' + context.parsed.y;
            
            const originalDate = filteredData[dataIndex]?.Date;
            const dateData = dataByDate[originalDate];
            
            // Pour les événements, afficher le nom au lieu de la valeur
            if (context.dataset.label === 'Jours avec événements' && dateData?.has_event) {
              const eventName = dateData?.event_name || 'Événement spécial';
              return `Événement: ${eventName}`;
            }
            
            // Pour les vacances, afficher le nom au lieu de la valeur
            if (context.dataset.label === 'Jours de vacances' && dateData?.has_vacation) {
              const vacanceName = dateData?.vacance_name || 'Période de vacances';
              return `Vacance: ${vacanceName}`;
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

  const getUniqueValues = (field) => {
    if (!data?.merged_data) return [];
    return [...new Set(data.merged_data.map(item => item[field]))].sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadData}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard ONCF</h1>
        <p className="text-muted-foreground">
          Visualisation des données de trafic passagers et analyse des tendances
        </p>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{metrics.totalRecords.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Jours avec événements</p>
              <p className="text-2xl font-bold">{metrics.eventDays}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Sun className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Jours de vacances</p>
              <p className="text-2xl font-bold">{metrics.vacationDays}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Plage de dates</p>
              <p className="text-sm font-medium">
                {metrics.dateRange.start && metrics.dateRange.end ? (
                  <>
                    {metrics.dateRange.start.toLocaleDateString('fr-FR')} - {metrics.dateRange.end.toLocaleDateString('fr-FR')}
                  </>
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="bg-card border rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtres:</span>
            </div>
            
            <Select value={selectedTrainId} onValueChange={setSelectedTrainId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sélectionner un train" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les trains</SelectItem>
                {getUniqueValues('Train_ID').map(trainId => (
                  <SelectItem key={trainId} value={trainId}>
                    Train {trainId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedVille} onValueChange={setSelectedVille}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {getUniqueValues('Ville_Arrivee').map(ville => (
                  <SelectItem key={ville} value={ville}>
                    {ville}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Type de graphique:</span>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
              className="flex items-center space-x-2"
            >
              <LineChart className="h-4 w-4" />
              <span>Ligne</span>
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Barres</span>
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="bg-card border rounded-lg p-6">
        <div className="h-96">
          {chartData ? (
            chartType === 'line' ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Aucune donnée à afficher</p>
            </div>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 text-sm text-muted-foreground">
        <p><strong>Légende:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><span className="text-blue-500">●</span> Nombre de passagers</li>
          <li><span className="text-red-500">●</span> Jours avec événements</li>
          <li><span className="text-green-500">●</span> Jours de vacances</li>
        </ul>
      </div>

      {/* Événements et Vacances Futures */}
      {(futureEvents.future_events.length > 0 || futureEvents.future_holidays.length > 0) && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Événements et Vacances Futures</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Événements Futurs */}
            {futureEvents.future_events.length > 0 && (
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="h-6 w-6 text-orange-500" />
                  <h3 className="text-lg font-semibold">Événements à venir</h3>
                </div>
                <div className="space-y-3">
                  {futureEvents.future_events.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-medium text-orange-800">{event.description || event.Description_Evenement}</p>
                        <p className="text-sm text-orange-600">{event.type || 'Événement'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-800">
                          {new Date(event.date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-orange-600">
                          {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vacances Futures */}
            {futureEvents.future_holidays.length > 0 && (
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Sun className="h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-semibold">Vacances à venir</h3>
                </div>
                <div className="space-y-3">
                  {futureEvents.future_holidays.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-medium text-blue-800">{holiday.titre || holiday.Titre_Vacances}</p>
                        <p className="text-sm text-blue-600">{holiday.type || 'Vacance'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-800">
                          {new Date(holiday.date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-blue-600">
                          {new Date(holiday.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 