import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Download,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';
import { apiService, handleApiError, downloadFile } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { FileUpload } from '../../components/ui/FileUpload';

const UploadTrainPage = () => {
  const [files, setFiles] = useState({
    passengers: null,
    evenements: null,
    vacances: null
  });
  
  const [uploadStatus, setUploadStatus] = useState({
    passengers: { uploaded: false, loading: false, error: null, result: null },
    evenements: { uploaded: false, loading: false, error: null, result: null },
    vacances: { uploaded: false, loading: false, error: null, result: null }
  });
  
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  const [modelConfig, setModelConfig] = useState({
    modelType: 'linear_regression',
    daysToPredict: 30
  });
  
  const [trainingResult, setTrainingResult] = useState(null);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingError, setTrainingError] = useState(null);

  const handleFileSelect = (fileType) => (selectedFiles) => {
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(prev => ({
        ...prev,
        [fileType]: selectedFiles[0]
      }));
      // Reset upload status for this file type
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { uploaded: false, loading: false, error: null, result: null }
      }));
    }
  };

  const handleUploadFile = async (fileType) => {
    const file = files[fileType];
    if (!file) {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { ...prev[fileType], error: 'Aucun fichier sélectionné' }
      }));
      return;
    }

    try {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { ...prev[fileType], loading: true, error: null }
      }));
      
      let result;
      switch (fileType) {
        case 'passengers':
          result = await apiService.uploadPassengers(file);
          break;
        case 'evenements':
          result = await apiService.uploadEvents(file);
          break;
        case 'vacances':
          result = await apiService.uploadHolidays(file);
          break;
        default:
          throw new Error('Type de fichier non reconnu');
      }
      
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { uploaded: true, loading: false, error: null, result }
      }));
      
      // Si tous les fichiers sont uploadés, mettre à jour l'état global
      const allUploaded = Object.values(uploadStatus).every(status => status.uploaded) || 
                         (uploadStatus[fileType].uploaded && 
                          (fileType === 'passengers' || 
                           (fileType === 'evenements' && uploadStatus.passengers.uploaded) ||
                           (fileType === 'vacances' && uploadStatus.passengers.uploaded)));
      
      if (allUploaded) {
        setUploadResult({
          message: "Tous les fichiers ont été uploadés avec succès",
          total_records: result.total_records || 0,
          merged_available: result.merged_available || false
        });
      }
      
    } catch (err) {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { uploaded: false, loading: false, error: handleApiError(err), result: null }
      }));
    }
  };

  const handleTrainAndPredict = async () => {
    if (!uploadResult) {
      setTrainingError('Veuillez d\'abord uploader et fusionner les données');
      return;
    }

    try {
      setTrainingLoading(true);
      setTrainingError(null);
      
      const result = await apiService.trainAndPredict(
        modelConfig.modelType,
        modelConfig.daysToPredict
      );
      
      setTrainingResult(result);
      setTrainingError(null);
    } catch (err) {
      setTrainingError(handleApiError(err));
    } finally {
      setTrainingLoading(false);
    }
  };

  const handleExportPredictions = async () => {
    if (!trainingResult) {
      alert('Aucune prédiction à exporter. Veuillez d\'abord entraîner un modèle.');
      return;
    }
    
    try {
      const blob = await apiService.exportPredictions();
      const filename = `predictions_${modelConfig.modelType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(blob, filename);
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      alert(`Erreur lors de l'export: ${handleApiError(err)}`);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm('Voulez-vous vraiment réinitialiser toutes les données ? Cela supprimera tous les fichiers uploadés et les résultats.')) {
      return;
    }

    try {
      await apiService.resetData();
      
      // Remettre tous les états à zéro
      setFiles({
        passengers: null,
        evenements: null,
        vacances: null
      });
      
      setUploadStatus({
        passengers: { uploaded: false, loading: false, error: null, result: null },
        evenements: { uploaded: false, loading: false, error: null, result: null },
        vacances: { uploaded: false, loading: false, error: null, result: null }
      });
      
      setUploadResult(null);
      setTrainingResult(null);
      setTrainingError(null);
      setUploadError(null);
      
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const modelOptions = [
    { value: 'Linear Regression', label: 'Régression Linéaire', description: 'Modèle simple et rapide' },
    { value: 'Random Forest', label: 'Random Forest', description: 'Modèle robuste et précis' },
    { value: 'XGBoost', label: 'XGBoost', description: 'Modèle avancé avec haute performance' }
  ];

  const getModelPerformanceColor = (r2) => {
    if (r2 >= 0.8) return 'text-green-600';
    if (r2 >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload & Entraînement</h1>
        <p className="text-muted-foreground">
          Importez vos données CSV et entraînez des modèles de prédiction
        </p>
        <div className="mt-4 flex space-x-2">
          <Button onClick={handleResetAll} variant="destructive">
            Réinitialiser tout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Upload */}
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Upload className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Upload des Données</h2>
            </div>

            <div className="space-y-6">
              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fichier Passagers (passengers.csv)
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect('passengers')}
                  acceptedFileTypes={['.csv']}
                  label="Glissez-déposez le fichier passengers.csv"
                />
                <div className="mt-2 flex items-center space-x-2">
                  <Button
                    onClick={() => handleUploadFile('passengers')}
                    disabled={uploadStatus.passengers.loading || !files.passengers}
                    size="sm"
                  >
                    {uploadStatus.passengers.loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Upload...
                      </>
                    ) : (
                      'Upload Passagers'
                    )}
                  </Button>
                  {uploadStatus.passengers.uploaded && (
                    <span className="text-green-600 text-sm">✓ Uploadé</span>
                  )}
                  {uploadStatus.passengers.error && (
                    <span className="text-red-600 text-sm">{uploadStatus.passengers.error}</span>
                  )}
                </div>
              </div>

              {/* Events */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fichier Événements (evenements.csv)
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect('evenements')}
                  acceptedFileTypes={['.csv']}
                  label="Glissez-déposez le fichier evenements.csv"
                />
                <div className="mt-2 flex items-center space-x-2">
                  <Button
                    onClick={() => handleUploadFile('evenements')}
                    disabled={uploadStatus.evenements.loading || !files.evenements}
                    size="sm"
                  >
                    {uploadStatus.evenements.loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Upload...
                      </>
                    ) : (
                      'Upload Événements'
                    )}
                  </Button>
                  {uploadStatus.evenements.uploaded && (
                    <span className="text-green-600 text-sm">✓ Uploadé</span>
                  )}
                  {uploadStatus.evenements.error && (
                    <span className="text-red-600 text-sm">{uploadStatus.evenements.error}</span>
                  )}
                </div>
              </div>

              {/* Vacations */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fichier Vacances (vacances.csv)
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect('vacances')}
                  acceptedFileTypes={['.csv']}
                  label="Glissez-déposez le fichier vacances.csv"
                />
                <div className="mt-2 flex items-center space-x-2">
                  <Button
                    onClick={() => handleUploadFile('vacances')}
                    disabled={uploadStatus.vacances.loading || !files.vacances}
                    size="sm"
                  >
                    {uploadStatus.vacances.loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Upload...
                      </>
                    ) : (
                      'Upload Vacances'
                    )}
                  </Button>
                  {uploadStatus.vacances.uploaded && (
                    <span className="text-green-600 text-sm">✓ Uploadé</span>
                  )}
                  {uploadStatus.vacances.error && (
                    <span className="text-red-600 text-sm">{uploadStatus.vacances.error}</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note :</strong> Vous pouvez uploader les fichiers un par un. 
                  Le fichier passagers est obligatoire, les autres sont optionnels.
                </p>
              </div>
            </div>
          </div>

          {/* Résultats Upload */}
          {uploadResult && (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold">Données fusionnées avec succès</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total records:</p>
                  <p className="font-medium">{uploadResult.total_records?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Événements:</p>
                  <p className="font-medium">{uploadResult.events_count || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jours de vacances:</p>
                  <p className="font-medium">{uploadResult.holidays_count || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plage de dates:</p>
                  <p className="font-medium">
                    {uploadResult.date_range?.start} - {uploadResult.date_range?.end}
                  </p>
                </div>
              </div>
              {/* Aperçu simple des données */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Aperçu des données :</p>
                {uploadResult.sample_data && uploadResult.sample_data.length > 0 ? (
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full text-xs border">
                      <thead>
                        <tr>
                          {Object.keys(uploadResult.sample_data[0]).map((col) => (
                            <th key={col} className="border px-2 py-1 bg-muted">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResult.sample_data.map((row, idx) => (
                          <tr key={idx} className="border-b">
                            {Object.keys(row).map((col) => (
                              <td key={col} className="border px-2 py-1">{row[col]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Aucune donnée à afficher.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section Entraînement */}
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold">Configuration du Modèle</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type de modèle
                </label>
                <Select 
                  value={modelConfig.modelType} 
                  onValueChange={(value) => setModelConfig(prev => ({ ...prev, modelType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
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
                  value={modelConfig.daysToPredict}
                  onChange={(e) => setModelConfig(prev => ({ 
                    ...prev, 
                    daysToPredict: parseInt(e.target.value) || 30 
                  }))}
                  placeholder="30"
                />
              </div>

              <Button
                onClick={handleTrainAndPredict}
                disabled={trainingLoading || !uploadResult}
                className="w-full"
              >
                {trainingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entraînement en cours...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Lancer l'entraînement et la prédiction
                  </>
                )}
              </Button>

              {trainingError && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive text-sm">{trainingError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Résultats Entraînement */}
          {trainingResult && (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold">Résultats de l'entraînement</h3>
              </div>

              {/* Performance */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">R² Score</span>
                  </div>
                  <p className={`text-xl font-bold ${getModelPerformanceColor(trainingResult.model_performance?.r2)}`}>
                    {(trainingResult.model_performance?.r2 * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">MSE</span>
                  </div>
                  <p className="text-xl font-bold">
                    {trainingResult.model_performance?.mse?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Prédictions */}
              {trainingResult.predictions && trainingResult.predictions.length > 0 && (
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
                        </tr>
                      </thead>
                      <tbody>
                        {trainingResult.predictions.slice(0, 10).map((pred, index) => (
                          <tr key={index} className="border-b border-border/50">
                            <td className="py-2">{pred.date}</td>
                            <td className="py-2">{pred.train_id}</td>
                            <td className="py-2">{pred.ville_arrivee}</td>
                            <td className="py-2 font-medium">
                              {Math.round(pred.predicted_passengers).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {trainingResult.predictions.length > 10 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Affichage des 10 premières prédictions sur {trainingResult.predictions.length}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadTrainPage; 