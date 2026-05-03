import { api } from "../../api/api";

/*
==============================
GET INVENTORY
==============================
*/

export const getInventory = async () => {

  const res = await api.get("/inventory");
  return res.data;

};

/*
==============================
ADD PRODUCT
==============================
*/

export const addProduct = async (data: any) => {

  const res = await api.post("/inventory", data);
  return res.data;

};

/*
==============================
UPDATE PRODUCT
==============================
*/

export const updateProduct = async (id: string, data: any) => {

  const res = await api.put(`/inventory/${id}`, data);
  return res.data;

};

/*
==============================
DELETE PRODUCT
==============================
*/

export const deleteProduct = async (id: string) => {

  const res = await api.delete(`/inventory/${id}`);
  return res.data;

};