import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Prevent infinite redirect loops if we're already on login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const verifyByHash = (hash) => api.get(`/verify/hash/${hash}`);
export const verifyById = (certId) => api.get(`/verify/id/${certId}`);
export const verifyBulk = (items, type) => api.post('/verify/bulk', { items, type });
export const verifyByFile = (file, issuerName) => {
  const formData = new FormData();
  formData.append('certificate', file);
  formData.append('issuerName', issuerName);
  return api.post('/verify', formData);
};

export const registerCertificate = (certData) => api.post('/issuer/register', certData);

export const getIssuerCertificates = () => api.get('/issuer/certificates');
export const revokeCertificate = (certId, reason) => api.post('/issuer/revoke', { certId, reason });

export const login = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/profile');

export const getIssuers = () => api.get('/issuer');
export const authorizeIssuer = (issuerData) => api.post('/issuer/authorize', issuerData);
export const revokeIssuer = (address) => api.post(`/issuer/revoke/${address}`);

export default api;
