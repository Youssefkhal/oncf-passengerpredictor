import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalHeader from './components/ui/GlobalHeader';
import DashboardPage from './pages/main-dashboard';
import UploadTrainPage from './pages/data-upload-management';
import PredictPage from './pages/prediction-interface';

const AppRoutes = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload-train" element={<UploadTrainPage />} />
            <Route path="/predict" element={<PredictPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default AppRoutes; 