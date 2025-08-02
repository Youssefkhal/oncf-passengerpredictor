import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Bar, Doughnut } from 'react-chartjs-2'

const API_BASE_URL = 'http://localhost:8000'

function DashboardPage({ predictionHistory }) {
  const [serverHistory, setServerHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentDateInfo, setCurrentDateInfo] = useState(null)
  const [dateInfoLoading, setDateInfoLoading] = useState(false)

  useEffect(() => {
    fetchServerHistory()
    fetchCurrentDateInfo()
  }, [])

  const fetchServerHistory = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/prediction-history`)
      setServerHistory(response.data.history || [])
    } catch (err) {
      setError('Error fetching prediction history')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentDateInfo = async () => {
    setDateInfoLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/current-date-info`)
      setCurrentDateInfo(response.data)
    } catch (err) {
      console.error('Error fetching current date info:', err)
      // Don't set error for this, as it's not critical
    } finally {
      setDateInfoLoading(false)
    }
  }

  const exportToCsv = async (predictionIndex) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/export-predictions/${predictionIndex}`)
      
      // Create and download CSV file
      const csvData = response.data.csv_data
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `predictions_${predictionIndex}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Error exporting predictions')
    }
  }

  const exportLocalToCsv = (prediction) => {
    // Convert prediction data to CSV format
    const headers = ['Date', 'Train_ID', 'Ville_Arrivée', 'Predicted_Passengers']
    const csvContent = [
      headers.join(','),
      ...prediction.predictions.map(p => 
        `${p.date},${p.train_id},${p.ville_arrivee},${p.predicted_passengers}`
      )
    ].join('\n')

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `predictions_${prediction.model_type.replace(' ', '_')}_${new Date(prediction.timestamp).toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const renderPredictionCard = (prediction, index, isLocal = false) => {
    const timestamp = new Date(prediction.timestamp).toLocaleString()
    const performance = prediction.model_performance || {}

    return (
      <div key={index} className="dashboard-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
              🎯 Prediction #{index + 1}
            </h3>
            <p><strong>🤖 Model:</strong> {prediction.model_type}</p>
            <p><strong>📅 Date:</strong> {timestamp}</p>
            <p><strong>⏱️ Days Predicted:</strong> {prediction.days_predicted}</p>
          </div>
          
          <button
            className="btn btn-secondary"
            onClick={() => isLocal ? exportLocalToCsv(prediction) : exportToCsv(index)}
            style={{ minWidth: '120px' }}
          >
            📥 Export CSV
          </button>
        </div>
        
        {performance.mse !== undefined && (
          <div className="performance-metrics" style={{ marginBottom: '1rem' }}>
            <div className="metric">
              <span className="metric-label">R² Score</span>
              <span className="metric-value">{performance.r2?.toFixed(4) || 'N/A'}</span>
            </div>
            <div className="metric">
              <span className="metric-label">MSE</span>
              <span className="metric-value">{performance.mse?.toFixed(2) || 'N/A'}</span>
            </div>
          </div>
        )}

        <div>
          <h4 style={{ color: '#333', marginBottom: '1rem' }}>📊 Prediction Summary</h4>
          <div className="metric" style={{ marginBottom: '1rem' }}>
            <span className="metric-label">Total Predictions</span>
            <span className="metric-value">{prediction.predictions?.length || 0}</span>
          </div>
          
          {prediction.predictions && prediction.predictions.length > 0 && (
            <div style={{ 
              background: '#f8f9fa', 
              borderRadius: '10px', 
              padding: '1rem',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              <div className="predictions-list">
                {prediction.predictions.slice(0, 5).map((pred, predIndex) => (
                  <div key={predIndex} className="prediction-item" style={{ 
                    background: 'white',
                    margin: '0.5rem 0',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong>{new Date(pred.date).toLocaleDateString()}</strong> - 
                      Train {pred.train_id} → {pred.ville_arrivee}
                    </div>
                    <span className="prediction-value">
                      {Math.round(pred.predicted_passengers)} passengers
                    </span>
                  </div>
                ))}
              </div>
              {prediction.predictions.length > 5 && (
                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                  ... and {prediction.predictions.length - 5} more predictions
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Prepare analytics data
  const getAnalyticsData = () => {
    const allPredictions = [...predictionHistory, ...serverHistory]
    if (allPredictions.length === 0) return null

    // Model usage statistics
    const modelUsage = {}
    allPredictions.forEach(pred => {
      modelUsage[pred.model_type] = (modelUsage[pred.model_type] || 0) + 1
    })

    // Total predictions by destination
    const destinationTotals = {}
    allPredictions.forEach(pred => {
      pred.predictions?.forEach(p => {
        destinationTotals[p.ville_arrivee] = (destinationTotals[p.ville_arrivee] || 0) + p.predicted_passengers
      })
    })

    return { modelUsage, destinationTotals }
  }

  const analyticsData = getAnalyticsData()

  const modelUsageChartData = analyticsData ? {
    labels: Object.keys(analyticsData.modelUsage),
    datasets: [{
      data: Object.values(analyticsData.modelUsage),
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(56, 161, 105, 0.8)',
        'rgba(229, 62, 62, 0.8)',
        'rgba(237, 137, 54, 0.8)'
      ],
      borderColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(118, 75, 162, 1)',
        'rgba(56, 161, 105, 1)',
        'rgba(229, 62, 62, 1)',
        'rgba(237, 137, 54, 1)'
      ],
      borderWidth: 2
    }]
  } : null

  const destinationChartData = analyticsData ? {
    labels: Object.keys(analyticsData.destinationTotals),
    datasets: [{
      label: 'Total Predicted Passengers',
      data: Object.values(analyticsData.destinationTotals),
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      borderRadius: 8
    }]
  } : null

  return (
    <div className="dashboard-page">
      <h2>📊 Analytics Dashboard</h2>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
        Comprehensive view of your prediction history and model performance analytics.
      </p>

      {error && (
        <div className="alert alert-error">
          ❌ <strong>Error:</strong> {error}
        </div>
      )}

      {/* Current Date Information */}
      {currentDateInfo && (
        <div className="dashboard-card" style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem'
        }}>
          <h3 style={{
            color: 'white',
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            Date: {currentDateInfo.formatted_date}
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Average Prediction */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.8rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#4A90E2',
                borderRadius: '50%',
                marginRight: '0.8rem',
                flexShrink: 0
              }}></div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                Prédiction passagers (moyenne): {currentDateInfo.average_prediction}
              </span>
            </div>

            {/* Events */}
            {currentDateInfo.has_events ? (
              currentDateInfo.events.map((event, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#E74C3C',
                    borderRadius: '50%',
                    marginRight: '0.8rem',
                    flexShrink: 0
                  }}></div>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    Jours avec événements: {event.name}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.8rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#95A5A6',
                  borderRadius: '50%',
                  marginRight: '0.8rem',
                  flexShrink: 0
                }}></div>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  Jours avec événements: Aucun événement
                </span>
              </div>
            )}

            {/* Holidays */}
            {currentDateInfo.has_holidays ? (
              currentDateInfo.holidays.map((holiday, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#27AE60',
                    borderRadius: '50%',
                    marginRight: '0.8rem',
                    flexShrink: 0
                  }}></div>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    Jours de vacances: {holiday.name}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.8rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#95A5A6',
                  borderRadius: '50%',
                  marginRight: '0.8rem',
                  flexShrink: 0
                }}></div>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  Jours de vacances: Aucune vacance
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {dateInfoLoading && (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <span className="loading"></span> Chargement des informations de la date...
        </div>
      )}

      {/* Analytics Overview */}
      {analyticsData && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📈 Total Predictions</h3>
            <div className="metric">
              <span className="metric-value">{predictionHistory.length + serverHistory.length}</span>
              <span className="metric-label">Prediction Sessions</span>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>🤖 Models Used</h3>
            <div className="metric">
              <span className="metric-value">{Object.keys(analyticsData.modelUsage).length}</span>
              <span className="metric-label">Different Models</span>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>🚂 Destinations</h3>
            <div className="metric">
              <span className="metric-value">{Object.keys(analyticsData.destinationTotals).length}</span>
              <span className="metric-label">Cities Analyzed</span>
            </div>
          </div>

          <div className="dashboard-card">
            <button
              className="btn btn-secondary"
              onClick={fetchServerHistory}
              disabled={loading}
              style={{ width: '100%', height: '100%' }}
            >
              {loading ? (
                <>
                  <span className="loading"></span> Refreshing...
                </>
              ) : (
                '🔄 Refresh History'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Charts */}
      {analyticsData && (
        <div className="dashboard-grid">
          {modelUsageChartData && (
            <div className="dashboard-card">
              <div className="chart-container">
                <h3>🧠 Model Usage Distribution</h3>
                <div style={{ height: '300px' }}>
                  <Doughnut 
                    data={modelUsageChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {destinationChartData && (
            <div className="dashboard-card">
              <div className="chart-container">
                <h3>🏙️ Passengers by Destination</h3>
                <div style={{ height: '300px' }}>
                  <Bar 
                    data={destinationChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Total Passengers'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Destination Cities'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prediction History */}
      {predictionHistory.length > 0 && (
        <div>
          <h3 style={{ margin: '2rem 0 1rem 0', color: '#333' }}>🔥 Current Session Predictions</h3>
          <div className="dashboard-grid">
            {predictionHistory.map((prediction, index) => 
              renderPredictionCard(prediction, index, true)
            )}
          </div>
        </div>
      )}

      {serverHistory.length > 0 && (
        <div>
          <h3 style={{ margin: '2rem 0 1rem 0', color: '#333' }}>💾 Server History</h3>
          <div className="dashboard-grid">
            {serverHistory.map((prediction, index) => 
              renderPredictionCard(prediction, index, false)
            )}
          </div>
        </div>
      )}

      {predictionHistory.length === 0 && serverHistory.length === 0 && !loading && (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="alert alert-info">
            <h3>📊 No Predictions Yet</h3>
            <p>Start by uploading your CSV files and making predictions using the Model & Prediction tab.</p>
            <p style={{ marginTop: '1rem', fontSize: '2rem' }}>🚂📈</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage