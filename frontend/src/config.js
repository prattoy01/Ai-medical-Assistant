// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5001',
    UPLOAD_BASE_URL: 'http://localhost:5001'
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app',
    UPLOAD_BASE_URL: process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app'
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export current config
export const currentConfig = config[environment];

// Helper functions
export const getApiUrl = (endpoint) => {
  return `${currentConfig.API_BASE_URL}${endpoint}`;
};

export const getUploadUrl = (filename) => {
  return `${currentConfig.UPLOAD_BASE_URL}/uploads/${filename}`;
};
