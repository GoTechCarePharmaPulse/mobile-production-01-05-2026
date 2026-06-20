import { api } from '@/src/api/api';

export const getMRDashboard = async (mrId) => {
  return api.get(`/api/mr/dashboard/${mrId}`);
};

export const postCheckIn = async (mrId, location) => {
  return api.post(`/api/mr/checkin`, { mrId, location });
};

export const postCheckOut = async (mrId, location) => {
  return api.post(`/api/mr/checkout`, { mrId, location });
};

export const getMRLocation = async (mrId) => {
  return api.get(`/api/mr/location/${mrId}`);
};


export const getMRS = () => api.get('/mrs');
export const getVisitsToday = () => api.get('/visits?date=today');
export const getMRLocations = () => api.get('/mr/locations');
