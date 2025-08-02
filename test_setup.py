#!/usr/bin/env python3
"""
Test script to verify ONCF Passenger Prediction setup
"""
import sys
import subprocess
import requests
import time
import os

def test_dependencies():
    """Test if all required dependencies are installed"""
    print("🧪 Testing Python dependencies...")
    
    try:
        import fastapi
        import uvicorn
        import pandas
        import sklearn
        import xgboost
        print("✅ All Python dependencies found")
        return True
    except ImportError as e:
        print(f"❌ Missing Python dependency: {e}")
        return False

def test_sample_data():
    """Test if sample data files exist and are valid"""
    print("📊 Testing sample data files...")
    
    files = ['passengers.csv', 'evenements.csv', 'vacances.csv']
    for file in files:
        path = f"sample_data/{file}"
        if os.path.exists(path):
            print(f"✅ {file} found")
        else:
            print(f"❌ {file} missing")
            return False
    
    # Test data loading
    try:
        import pandas as pd
        passengers = pd.read_csv('sample_data/passengers.csv')
        events = pd.read_csv('sample_data/evenements.csv')
        holidays = pd.read_csv('sample_data/vacances.csv')
        
        print(f"✅ Passengers data: {len(passengers)} records")
        print(f"✅ Events data: {len(events)} records")
        print(f"✅ Holidays data: {len(holidays)} records")
        return True
    except Exception as e:
        print(f"❌ Error loading sample data: {e}")
        return False

def test_backend_api():
    """Test if backend API is responding"""
    print("🔧 Testing backend API...")
    
    try:
        response = requests.get("http://localhost:12000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend API is responding")
            return True
        else:
            print(f"❌ Backend API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend API not accessible: {e}")
        print("💡 Make sure to start the backend server first:")
        print("   cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 12000")
        return False

def test_frontend():
    """Test if frontend is accessible"""
    print("🎨 Testing frontend...")
    
    try:
        response = requests.get("http://localhost:12001/", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend not accessible: {e}")
        print("💡 Make sure to start the frontend server first:")
        print("   cd frontend && npm run dev")
        return False

def main():
    print("🧪 ONCF Passenger Prediction - Setup Test")
    print("=" * 50)
    
    tests = [
        ("Dependencies", test_dependencies),
        ("Sample Data", test_sample_data),
        ("Backend API", test_backend_api),
        ("Frontend", test_frontend)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}:")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
        if not result:
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("🎉 All tests passed! Your setup is ready.")
        print("🌐 Open http://localhost:12001 to use the application")
    else:
        print("⚠️  Some tests failed. Please check the setup.")
        print("📖 See DOWNLOAD_AND_SETUP.md for troubleshooting")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())