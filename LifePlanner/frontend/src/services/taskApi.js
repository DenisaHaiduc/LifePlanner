// =============================================================================
// PRESENTATION LAYER - API Service
// =============================================================================

import axios from 'axios';

const API_BASE = '/api/tasks';

const taskApi = {
  getByDateRange: async (start, end) => {
    const res = await axios.get(`${API_BASE}/range`, {
      params: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data;
  },

  create: async (taskData) => {
    const res = await axios.post(API_BASE, taskData);
    return res.data;
  },

  update: async (id, taskData) => {
    const res = await axios.put(`${API_BASE}/${id}`, taskData);
    return res.data;
  },

  // Toggle single-day task completion
  toggleComplete: async (id) => {
    const res = await axios.patch(`${API_BASE}/${id}/toggle`);
    return res.data;
  },

  // Fetch streak data
  getStreak: async () => {
    const res = await axios.get(`${API_BASE}/streak`);
    return res.data;
  },

  // Toggle per-day completion for multi-day tasks and prep days
  toggleDayCompletion: async (taskId, date, type) => {
    const res = await axios.patch(`${API_BASE}/${taskId}/day-toggle`, { date, type });
    return res.data;
  },

  delete: async (id) => {
    await axios.delete(`${API_BASE}/${id}`);
  },
};

export default taskApi;
