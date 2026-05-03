export const approveUser = async (api, id) => {
  return api.put(`/users/${id}/approve`);
};

export const rejectUser = async (api, id) => {
  return api.put(`/users/${id}/reject`);
};