import axios from 'axios';
import baseDataJson from '../data/baseData.json';
import metricsMetaJson from '../data/metricsMeta.json';
import type { BaseRow, StyleMeta } from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
interface BaseDataResponse {
  brand: string;
  pcdWeeks: number;
  strategyWeeks: number;
  histPastWeeks: number;
  histFwdWeeks: number;
  baseRows: BaseRow[];
  styleMeta: Record<string, StyleMeta>;
  strategyInfo: {
    name: string;
    startDate: string;
    endDate: string;
    days: number;
    lockedFilters: {
      country: string;
      brand: string;
      currency: string;
    };
  };
  hierarchyOptions: {
    product: { id: string; label: string; enabled: boolean }[];
    store: { id: string; label: string; enabled: boolean }[];
  };
  channelOptions: string[];
  storeIdOptions: string[];
}

// Simulate API delay for realistic behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API service functions
export const explainabilityService = {
  // Get base data (simulates API call)
  async getBaseData(): Promise<BaseDataResponse> {
    await delay(300); // Simulate network delay
    // In production, this would be: return api.get('/explainability/base-data').then(res => res.data);
    return baseDataJson as unknown as BaseDataResponse;
  },

  // Get metrics metadata
  async getMetricsMeta() {
    await delay(100);
    return metricsMetaJson;
  },

  // Save filter configuration (placeholder for future API)
  async saveFilterConfig(filterName: string, filters: Record<string, unknown>) {
    await delay(200);
    console.log('Saving filter config:', filterName, filters);
    return { success: true, id: `filter-${Date.now()}` };
  },

  // Export data (placeholder for future API)
  async exportData(format: 'csv' | 'excel', _data: unknown) {
    await delay(500);
    console.log('Exporting data as', format);
    return { success: true, downloadUrl: '#' };
  },
};

// Request interceptor for auth (if needed in future)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
