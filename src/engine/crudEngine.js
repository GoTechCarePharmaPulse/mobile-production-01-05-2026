export const createCrud = (config) => {
  return {
    list: async (api, params = {}) => {
      const res = await api.get(config.endpoint, { params });
      return res.data;
    },

    get: async (api, id) => {
      const res = await api.get(`${config.endpoint}/${id}`);
      return res.data;
    },

    create: async (api, data) => {
      const res = await api.post(config.endpoint, data);
      return res.data;
    },

    update: async (api, id, data) => {
      const res = await api.put(`${config.endpoint}/${id}`, data);
      return res.data;
    },

    remove: async (api, id) => {
      const res = await api.delete(`${config.endpoint}/${id}`);
      return res.data;
    },
  };
};