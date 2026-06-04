import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const todoApi = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/todos`);
    return response.data;
  },

  getHealthyStats: async () => {
    const response = await axios.get(`${API_URL}/todos/healthy/stats`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/todos`, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/todos/${id}`, data);
    return response.data;
  },

  toggle: async (id) => {
    const response = await axios.patch(`${API_URL}/todos/${id}/toggle`);
    return response.data;
  },

  delete: async (id) => {
    await axios.delete(`${API_URL}/todos/${id}`);
  }
};

export const notificationApi = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/notifications`);
    return response.data;
  }
};
