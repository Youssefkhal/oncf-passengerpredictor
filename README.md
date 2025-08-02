# ONCF Passenger Prediction System

A full-stack web application for predicting passenger numbers on trains departing from Rabat, Morocco. Built for ONCF (Office National des Chemins de Fer du Maroc).

## 🎯 Features

- **Data Upload**: Upload and merge 3 CSV files (passengers, events, holidays)
- **Machine Learning Models**: Choose from Linear Regression, Random Forest, or XGBoost
- **Predictions**: Predict passenger numbers for future dates
- **Visualization**: Interactive charts showing historical and predicted data
- **Dashboard**: View prediction history and export results to CSV

## 📂 Project Structure

```
oncf-passenger-prediction/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Styles
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.js     # Vite configuration
│   └── index.html         # HTML template
├── sample_data/           # Example CSV files
│   ├── passengers.csv     # Sample passenger data
│   ├── evenements.csv     # Sample events data
│   └── vacances.csv       # Sample holidays data
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:12001`

## 📊 Data Format

### 1. passengers.csv
```csv
Date,Train_ID,Ville_Arrivée,Nombre_Passagers
2024-01-01,T001,Casablanca,150
2024-01-01,T002,Fès,120
```

### 2. evenements.csv
```csv
Date,Evenement_Present,Description_Evenement
2024-01-01,1,Nouvel An
2024-01-02,0,
```

### 3. vacances.csv
```csv
Date,Vacance,Titre_Vacances
2024-01-01,1,Nouvel An
2024-01-02,0,
```

## 🧠 Machine Learning Models

### Linear Regression
- Simple and interpretable
- Good baseline model
- Fast training and prediction

### Random Forest
- Handles non-linear relationships
- Robust to outliers
- Feature importance analysis

### XGBoost
- High performance gradient boosting
- Excellent for structured data
- Advanced regularization

## 🎨 Frontend Pages

### 1. Upload Page
- Upload the 3 required CSV files
- Preview merged data
- Validation and error handling

### 2. Model & Prediction Page
- Select machine learning model
- Choose number of days to predict
- View model performance metrics
- Interactive charts with historical and predicted data

### 3. Dashboard Page
- View prediction history
- Export results to CSV
- Model performance comparison

## 🔧 API Endpoints

### POST /upload-csv
Upload and merge CSV files
- **Body**: FormData with 3 files
- **Response**: Merged data preview

### POST /train-and-predict
Train model and make predictions
- **Body**: `{"model_type": "Linear Regression", "days_to_predict": 7}`
- **Response**: Predictions and model performance

### GET /prediction-history
Get all prediction history
- **Response**: List of historical predictions

### GET /export-predictions/{index}
Export specific prediction to CSV
- **Response**: CSV data

## 🛠️ Technical Stack

### Backend
- **FastAPI**: Modern Python web framework
- **pandas**: Data manipulation and analysis
- **scikit-learn**: Machine learning library
- **XGBoost**: Gradient boosting framework
- **uvicorn**: ASGI server

### Frontend
- **React**: UI library
- **Vite**: Build tool and dev server
- **Chart.js**: Data visualization
- **Axios**: HTTP client
- **CSS3**: Styling

## 📈 Model Features

The system uses the following features for prediction:

- **Train_ID**: Encoded categorical feature
- **Ville_Arrivée**: Encoded destination city
- **Date features**: Day of week, month, day
- **Événement_Présent**: Binary flag for events
- **Vacance**: Binary flag for holidays

## 🔍 Model Evaluation

Models are evaluated using:
- **Mean Squared Error (MSE)**: Lower is better
- **R² Score**: Higher is better (max 1.0)

## 🚀 Deployment

### Production Backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Production Frontend
```bash
npm run build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please contact the development team or create an issue in the repository.

## 🔮 Future Enhancements

- Real-time data integration
- Advanced feature engineering
- Model ensemble methods
- Mobile-responsive design improvements
- Database integration for persistent storage
- User authentication and authorization
- Advanced analytics and reporting
