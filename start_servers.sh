#!/bin/bash

echo "🚀 Starting ONCF Passenger Prediction Application..."
echo "=================================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "uvicorn\|vite\|python.*http.server" 2>/dev/null || true
sleep 2

# Start Backend (FastAPI)
echo "🔧 Starting Backend Server (FastAPI)..."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 12000 --reload &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start Frontend (React with Vite)
echo "🎨 Starting Frontend Server (React + Vite)..."
cd ../frontend
npm run dev -- --host 0.0.0.0 --port 12001 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 5

echo ""
echo "✅ Application is ready!"
echo "=================================================="
echo "🔗 Frontend: http://localhost:12001"
echo "🔗 Backend API: http://localhost:12000"
echo "📊 API Docs: http://localhost:12000/docs"
echo ""
echo "📁 Sample data files are available in: ./sample_data/"
echo "   - passengers.csv"
echo "   - evenements.csv" 
echo "   - vacances.csv"
echo ""
echo "🛑 To stop the servers, run: pkill -f 'uvicorn|vite'"
echo "=================================================="

# Keep script running
wait