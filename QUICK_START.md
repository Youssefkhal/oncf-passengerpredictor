# 🚀 ONCF Passenger Prediction - Quick Start Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ and npm installed

## 🏃‍♂️ Quick Start (Automated)

### Option 1: Use the startup script
```bash
cd /workspace/oncf-passenger-prediction
./start_servers.sh
```

### Option 2: Manual startup

#### 1. Start Backend (Terminal 1)
```bash
cd /workspace/oncf-passenger-prediction/backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 12000 --reload
```

#### 2. Start Frontend (Terminal 2)
```bash
cd /workspace/oncf-passenger-prediction/frontend
npm install
npm run dev -- --host 0.0.0.0 --port 12001
```

## 🌐 Access the Application

- **Frontend**: http://localhost:12001
- **Backend API**: http://localhost:12000
- **API Documentation**: http://localhost:12000/docs

## 📊 Using the Application

### Step 1: Upload Data
1. Go to the **Upload** page
2. Upload the 3 CSV files from `sample_data/`:
   - `passengers.csv`
   - `evenements.csv`
   - `vacances.csv`
3. Click "Merge Data" to combine all datasets

### Step 2: Train & Predict
1. Go to the **Model & Prediction** page
2. Select a model (Linear Regression, Random Forest, or XGBoost)
3. Enter number of days to predict (e.g., 7)
4. Click "Train & Predict"
5. View results and charts

### Step 3: Dashboard
1. Go to the **Dashboard** page
2. View historical predictions
3. Export results to CSV

## 🛑 Stop Servers
```bash
pkill -f "uvicorn|vite"
```

## 📁 Project Structure
```
oncf-passenger-prediction/
├── backend/           # FastAPI backend
├── frontend/          # React frontend
├── sample_data/       # Sample CSV files
├── start_servers.sh   # Automated startup script
└── README.md         # Detailed documentation
```

## 🔧 Troubleshooting

### Port conflicts
If ports 12000 or 12001 are in use:
- Backend: Change port in uvicorn command
- Frontend: Vite will automatically use next available port

### Dependencies
- Backend: `pip install -r backend/requirements.txt`
- Frontend: `npm install` in frontend directory

### API Connection Issues
- Ensure backend is running on port 12000
- Check frontend API URLs in `src/` files point to correct backend port