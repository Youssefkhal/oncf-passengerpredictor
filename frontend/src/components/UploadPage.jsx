import React, { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

function UploadPage({ uploadedData, setUploadedData }) {
  const [files, setFiles] = useState({
    passengers: null,
    evenements: null,
    vacances: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileChange = (fileType, file) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }))
    setError('')
    setSuccess('')
  }

  const handleUpload = async () => {
    if (!files.passengers || !files.evenements || !files.vacances) {
      setError('Please select all three CSV files')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('passengers_file', files.passengers)
      formData.append('evenements_file', files.evenements)
      formData.append('vacances_file', files.vacances)

      const response = await axios.post(`${API_BASE_URL}/upload-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setUploadedData(response.data)
      setSuccess('Files uploaded and merged successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading files')
    } finally {
      setLoading(false)
    }
  }

  const renderPreview = () => {
    if (!uploadedData?.preview) return null

    return (
      <div className="card">
        <h3>Data Preview</h3>
        <p>Total records: {uploadedData.total_records}</p>
        <p>Date range: {uploadedData.date_range?.start} to {uploadedData.date_range?.end}</p>
        
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Train ID</th>
                <th>Ville Arrivée</th>
                <th>Nombre Passagers</th>
                <th>Événement Présent</th>
                <th>Vacance</th>
              </tr>
            </thead>
            <tbody>
              {uploadedData.preview.map((row, index) => (
                <tr key={index}>
                  <td>{new Date(row.Date).toLocaleDateString()}</td>
                  <td>{row.Train_ID}</td>
                  <td>{row.Ville_Arrivée}</td>
                  <td>{row.Nombre_Passagers}</td>
                  <td>{row.Événement_Présent ? 'Yes' : 'No'}</td>
                  <td>{row.Vacance ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-page">
      <h2>📤 Upload CSV Files</h2>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
        Please upload the three required CSV files to begin the passenger prediction analysis.
      </p>
      
      <div className="file-upload-section">
        <div className="file-upload-card">
          <h3>🚂 Passengers Data</h3>
          <input
            id="passengers-file"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange('passengers', e.target.files[0])}
            className="file-input"
          />
          <p><strong>Expected columns:</strong><br/>Date, Train_ID, Ville_Arrivée, Nombre_Passagers</p>
          {files.passengers && <p style={{ color: '#38a169', fontWeight: '600' }}>✅ {files.passengers.name}</p>}
        </div>

        <div className="file-upload-card">
          <h3>🎉 Events Data</h3>
          <input
            id="evenements-file"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange('evenements', e.target.files[0])}
            className="file-input"
          />
          <p><strong>Expected columns:</strong><br/>Date, Événement_Présent, Description_Événement</p>
          {files.evenements && <p style={{ color: '#38a169', fontWeight: '600' }}>✅ {files.evenements.name}</p>}
        </div>

        <div className="file-upload-card">
          <h3>🏖️ Holidays Data</h3>
          <input
            id="vacances-file"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange('vacances', e.target.files[0])}
            className="file-input"
          />
          <p><strong>Expected columns:</strong><br/>Date, Vacance</p>
          {files.vacances && <p style={{ color: '#38a169', fontWeight: '600' }}>✅ {files.vacances.name}</p>}
        </div>
      </div>

      <button 
        onClick={handleUpload}
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', fontSize: '1.2rem', padding: '1.5rem', marginBottom: '2rem' }}
      >
        {loading ? (
          <>
            <span className="loading"></span> Uploading & Merging Data...
          </>
        ) : (
          '🚀 Upload & Merge Data'
        )}
      </button>

      {error && (
        <div className="alert alert-error">
          ❌ <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✅ <strong>Success:</strong> {success}
        </div>
      )}

      {uploadedData && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📊 Data Summary</h3>
            <div className="metric">
              <span className="metric-label">Total Records</span>
              <span className="metric-value">{uploadedData.total_records}</span>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>📋 Data Columns</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {uploadedData.columns?.map((col, index) => (
                <span key={index} style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {col}
                </span>
              ))}
            </div>
          </div>
          
          {uploadedData.sample_data && (
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔍 Sample Data Preview</h3>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '10px', 
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                <pre style={{ margin: 0, fontSize: '0.9rem' }}>
                  {JSON.stringify(uploadedData.sample_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UploadPage