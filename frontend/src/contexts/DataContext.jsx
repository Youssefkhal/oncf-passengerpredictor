import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { uploadCSVFiles, getDataPreview, trainAndPredict, getPredictionHistory } from '../services/api';

const DataContext = createContext();

const DATA_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_DATA: 'SET_DATA',
  SET_PREDICTIONS: 'SET_PREDICTIONS',
  SET_HISTORY: 'SET_HISTORY',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

const initialState = {
  loading: false,
  error: null,
  data: null,
  predictions: null,
  predictionHistory: [],
  dataPreview: null
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case DATA_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case DATA_ACTIONS.SET_DATA:
      return { ...state, data: action.payload };
    case DATA_ACTIONS.SET_PREDICTIONS:
      return { ...state, predictions: action.payload };
    case DATA_ACTIONS.SET_HISTORY:
      return { ...state, predictionHistory: action.payload };
    case DATA_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case DATA_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const uploadFiles = useCallback(async (passengersFile, evenementsFile, vacancesFile) => {
    dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: DATA_ACTIONS.CLEAR_ERROR });
    
    try {
      console.log('Starting file upload...');
      console.log('Files:', { passengersFile, evenementsFile, vacancesFile });
      
      const result = await uploadCSVFiles(passengersFile, evenementsFile, vacancesFile);
      console.log('Upload result:', result);
      
      dispatch({ type: DATA_ACTIONS.SET_DATA, payload: result });
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur lors du téléchargement';
      dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const getPreview = useCallback(async () => {
    dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await getDataPreview();
      dispatch({ type: DATA_ACTIONS.SET_DATA, payload: result });
      return result;
    } catch (error) {
      console.log('No data preview available:', error.message);
      // Don't set error for missing data, just set empty data
      dispatch({ type: DATA_ACTIONS.SET_DATA, payload: {
        total_records: 0,
        passengers_count: 0,
        events_count: 0,
        holidays_count: 0,
        date_range: null,
        last_updated: null
      }});
      return null;
    } finally {
      dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const trainAndPredictModel = useCallback(async (modelType, daysToPredict) => {
    dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await trainAndPredict(modelType, daysToPredict);
      dispatch({ type: DATA_ACTIONS.SET_PREDICTIONS, payload: result });
      return result;
    } catch (error) {
      dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const loadPredictionHistory = useCallback(async () => {
    try {
      const result = await getPredictionHistory();
      dispatch({ type: DATA_ACTIONS.SET_HISTORY, payload: result.history });
      return result;
    } catch (error) {
      console.log('No prediction history available:', error.message);
      // Don't set error for missing history, just set empty array
      dispatch({ type: DATA_ACTIONS.SET_HISTORY, payload: [] });
      return { history: [] };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: DATA_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    uploadFiles,
    getPreview,
    trainAndPredictModel,
    loadPredictionHistory,
    clearError
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 