# 📥 ONCF Passenger Prediction - Download & Setup Guide

## 🎯 Project Overview
Full-stack web application for ONCF to predict passenger numbers per train from Rabat using machine learning models (Linear Regression, Random Forest, XGBoost).

## 📋 Prerequisites
- **Python 3.8+** (with pip)
- **Node.js 16+** and **npm**
- **Git** (optional, for cloning)

## 📦 Download Options

### Option 1: Download Archive
1. Download the project archive: `oncf-passenger-prediction.tar.gz`
2. Extract: `tar -xzf oncf-passenger-prediction.tar.gz`
3. Navigate: `cd oncf-passenger-prediction`

### Option 2: Manual File Creation
If you need to recreate the project manually, follow the file structure below.

## 📁 Project Structure
```
oncf-passenger-prediction/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── predictions.json        # Stored predictions
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Styles
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.js         # Vite configuration
│   └── index.html             # HTML template
├── sample_data/
│   ├── passengers.csv         # Sample passenger data
│   ├── evenements.csv         # Sample events data
│   └── vacances.csv           # Sample holidays data
├── start_servers.sh           # Automated startup script
├── README.md                  # Detailed documentation
└── QUICK_START.md            # Quick start guide
```

## 🚀 Installation & Setup

### Step 1: Backend Setup
```bash
cd oncf-passenger-prediction/backend

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi, uvicorn, pandas, sklearn, xgboost; print('All dependencies installed!')"
```

### Step 2: Frontend Setup
```bash
cd ../frontend

# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

## 🏃‍♂️ Running the Application

### Option 1: Automated Start (Recommended)
```bash
cd oncf-passenger-prediction
chmod +x start_servers.sh
./start_servers.sh
```

### Option 2: Manual Start

#### Terminal 1 - Backend
```bash
cd oncf-passenger-prediction/backend
python -m uvicorn main:app --host 0.0.0.0 --port 12000 --reload
```

#### Terminal 2 - Frontend
```bash
cd oncf-passenger-prediction/frontend
npm run dev -- --host 0.0.0.0 --port 12001
```

## 🌐 Access Points
- **Frontend Application**: http://localhost:12001
- **Backend API**: http://localhost:12000
- **API Documentation**: http://localhost:12000/docs

## 🧪 Testing the Application

### Step 1: Upload Data
1. Open http://localhost:12001
2. Go to **Upload** page
3. Upload the 3 CSV files from `sample_data/`:
   - `passengers.csv` (45 records, 2024-01-01 to 2024-01-15)
   - `evenements.csv` (events data)
   - `vacances.csv` (holidays data)
4. Click **"Merge Data"** - should show 45 merged records
5. Click **"Next: Model & Prediction"**

### Step 2: Train & Predict
1. Select a model: **Linear Regression**, **Random Forest**, or **XGBoost**
2. Enter prediction days: `7` (for 7 days ahead)
3. Click **"Train & Predict"**
4. View results:
   - Predictions table by city and date
   - Interactive chart showing historical vs predicted data
5. Click **"Next: Dashboard"**

### Step 3: Dashboard
1. View historical predictions
2. Export results to CSV
3. See model performance metrics

## 🔧 Troubleshooting

### Port Conflicts
If ports are in use, the servers will automatically find available ports:
- Backend: Change `--port 12000` to another port
- Frontend: Vite will auto-select next available port

### Dependencies Issues
```bash
# Backend dependencies
cd backend
pip install fastapi uvicorn pandas scikit-learn xgboost python-multipart

# Frontend dependencies
cd frontend
npm install react react-dom @vitejs/plugin-react vite axios chart.js react-chartjs-2
```

### API Connection Issues
- Ensure backend is running first
- Check console for CORS errors
- Verify API URLs in frontend code point to correct backend port

### Sample Data Issues
The sample data contains:
- **15 days** of data (2024-01-01 to 2024-01-15)
- **3 trains** (TGV001, TGV002, TGV003)
- **3 destinations** (Casablanca, Fès, Marrakech)
- **45 total records** after merging

## 📊 Expected Results
After successful setup and testing:
- Upload should merge 45 records
- Model training should complete without errors
- Predictions should generate for next 7 days
- Charts should display historical and predicted data
- Dashboard should show saved predictions

## 🛑 Stop Servers
```bash
# Kill all related processes
pkill -f "uvicorn|vite"

# Or use Ctrl+C in each terminal
```

## 📞 Support
If you encounter issues:
1. Check that all dependencies are installed
2. Verify Python and Node.js versions
3. Ensure ports 12000-12010 are available
4. Check console logs for error messages

## 🎉 Success Indicators
✅ Backend API responds at http://localhost:12000  
✅ Frontend loads at http://localhost:12001  
✅ File upload works with sample data  
✅ Data merging shows 45 records  
✅ Model training completes successfully  
✅ Predictions generate and display  
✅ Charts render with data  
✅ CSV export works from dashboard  

---
**Happy Testing! 🚀**