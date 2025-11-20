import axios from 'axios';
const api = axios;
import type { DataResponse, PredictionRequest, PredictionResponse, MultiDayPredictionResponse } from '../types/aqi.types';

export const aqiApi = {
  // Get historical data
  getData: async (params: { country?: string; limit?: number; offset?: number }) => {
    return api.get<DataResponse>('/api/data', { params });
  },

  // Get regions (optionally filtered by country)
  getRegions: async (country?: string) => {
    return api.get<{ success: boolean; regions?: string[]; countries?: Record<string, string[]>; country?: string }>('/api/regions', {
      params: country ? { country } : {}
    });
  },

  // Predict AQI (returns single or multi-day prediction)
  predict: async (data: PredictionRequest, months: number = 6) => {
    return api.post<PredictionResponse | MultiDayPredictionResponse>('/api/predict', data, {
      params: { months }
    });
  },

  // Health check
  health: async () => {
    return api.get('/health');
  },
};

export const fetchData =async() => {
  try {
    const response = await axios.get("http://localhost:3001/api/data");
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}