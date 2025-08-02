import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
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
  TimeScale
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'

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
)

const API_BASE_URL = 'http://localhost:8000'

function ModelPage({ uploadedData }) {
  const [selectedModel, setSelectedModel] = useState('Linear Regression')
  const [daysToPredict, setDaysToPredict] = useState(7)
  const [predictions, setPredictions] = useState([])
  const [modelPerformance, setModelPerformance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const chartRef = useRef(null)

  // Prepare chart data
  const prepareChartData = () => {
    if (!predictions.length) return null

    // Group predictions by city
    const cityData = {}
    predictions.forEach(pred => {
      if (!cityData[pred.ville_arrivee]) {
        cityData[pred.ville_arrivee] = []
      }
      cityData[pred.ville_arrivee].push({
        x: pred.date,
        y: pred.predicted_passengers
      })
    })

    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(56, 161, 105, 0.8)',
      'rgba(229, 62, 62, 0.8)',
      'rgba(237, 137, 54, 0.8)',
      'rgba(128, 90, 213, 0.8)'
    ]

    const datasets = Object.keys(cityData).map((city, index) => ({
      label: city,
      data: cityData[city],
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('0.8', '0.2'),
      borderWidth: 3,
      fill: false,
      tension: 0.4
    }))

    return {
      datasets
    }
  }

  const prepareCityBarData = () => {
    if (!predictions.length) return null

    const cityTotals = {}
    predictions.forEach(pred => {
      if (!cityTotals[pred.ville_arrivee]) {
        cityTotals[pred.ville_arrivee] = 0
      }
      cityTotals[pred.ville_arrivee] += pred.predicted_passengers
    })

    return {
      labels: Object.keys(cityTotals),
      datasets: [{
        label: 'Total Predicted Passengers',
        data: Object.values(cityTotals),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(56, 161, 105, 0.8)',
          'rgba(229, 62, 62, 0.8)',
          'rgba(237, 137, 54, 0.8)',
          'rgba(128, 90, 213, 0.8)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(56, 161, 105, 1)',
          'rgba(229, 62, 62, 1)',
          'rgba(237, 137, 54, 1)',
          'rgba(128, 90, 213, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    }
  }

  const handleTrainAndPredict = async () => {
    console.log('Starting training...')
    setDebugInfo('Starting API call...')
    
    if (!uploadedData || !uploadedData.merged_data || uploadedData.merged_data.length === 0) {
      setError('No data available. Please upload and merge CSV files first.')
      setDebugInfo('No merged data available')
      return
    }

    setLoading(true)
    setError('')
    setDebugInfo(`Calling API with model: ${selectedModel}, days: ${daysToPredict}`)

    try {
      console.log('Making API call to:', `${API_BASE_URL}/train-and-predict`)
      
      const response = await axios.post(`${API_BASE_URL}/train-and-predict`, {
        model_type: selectedModel,
        days_to_predict: parseInt(daysToPredict)
      })

      console.log('API Response:', response.data)
      setDebugInfo('API call successful!')
      setPredictions(response.data.predictions)
      setModelPerformance(response.data.model_performance)
      
    } catch (err) {
      console.error('API Error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error'
      setError(errorMsg)
      setDebugInfo(`API Error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const lineChartData = prepareChartData()
  const barChartData = prepareCityBarData()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Passenger Predictions by Destination',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM dd'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Passengers'
        },
        beginAtZero: true
      }
    }
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Total Predicted Passengers by Destination',
        font: {
          size: 16,
          weight: 'bold'
        }
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
  }

  return (
    <div className="model-page">
      <h2>🤖 AI Model Selection & Prediction</h2>
      
      <div className="debug-info">
        <h3>🔍 System Status</h3>
        <p><strong>Data Structure:</strong> {uploadedData ? JSON.stringify(Object.keys(uploadedData)) : 'None'}</p>
        <p><strong>Records Available:</strong> {uploadedData?.merged_data ? `${uploadedData.merged_data.length} records` : 'None'}</p>
        <p><strong>API Status:</strong> {debugInfo}</p>
      </div>
      
      <div className="model-controls">
        <div className="form-group">
          <label htmlFor="model-select">🧠 Select ML Model:</label>
          <select 
            id="model-select"
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="form-control"
          >
            <option value="Linear Regression">📈 Linear Regression</option>
            <option value="Random Forest">🌳 Random Forest</option>
            <option value="XGBoost">⚡ XGBoost</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="days-input">📅 Days to Predict:</label>
          <input
            id="days-input"
            type="number"
            min="1"
            max="30"
            value={daysToPredict}
            onChange={(e) => setDaysToPredict(e.target.value)}
            className="form-control"
          />
        </div>

        <button 
          onClick={handleTrainAndPredict}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <span className="loading"></span> Training Model...
            </>
          ) : (
            '🚀 Train Model & Predict'
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ❌ <strong>Error:</strong> {error}
        </div>
      )}

      {modelPerformance && (
        <div className="model-performance">
          <h3>📊 Model Performance Metrics</h3>
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">R² Score</span>
              <span className="metric-value">{modelPerformance.r2_score?.toFixed(4) || 'N/A'}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Mean Squared Error</span>
              <span className="metric-value">{modelPerformance.mse?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Model Type</span>
              <span className="metric-value" style={{ fontSize: '1.2rem' }}>{selectedModel}</span>
            </div>
          </div>
        </div>
      )}

      {predictions.length > 0 && (
        <>
          <div className="dashboard-grid">
            {lineChartData && (
              <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
                <div className="chart-container">
                  <h3>📈 Predictions Timeline</h3>
                  <div style={{ height: '400px' }}>
                    <Line ref={chartRef} data={lineChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            {barChartData && (
              <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
                <div className="chart-container">
                  <h3>📊 Total Passengers by Destination</h3>
                  <div style={{ height: '300px' }}>
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="predictions-section">
            <h3>📈 Detailed Predictions</h3>
            <div className="predictions-list">
              {predictions.slice(0, 10).map((pred, index) => (
                <div key={index} className="prediction-item">
                  <div>
                    <strong>{pred.date}</strong> - Train {pred.train_id} → {pred.ville_arrivee}
                  </div>
                  <span className="prediction-value">
                    {Math.round(pred.predicted_passengers)} passengers
                  </span>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
              Showing 10 of {predictions.length} total predictions
            </p>
          </div>
        </>
      )}

      {(!uploadedData || !uploadedData.merged_data || uploadedData.merged_data.length === 0) && (
        <div className="alert alert-info">
          ℹ️ Please upload and merge CSV files first to enable AI model training.
        </div>
      )}
    </div>
  )
}

export default ModelPage