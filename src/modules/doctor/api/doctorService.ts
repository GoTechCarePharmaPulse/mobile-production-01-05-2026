import { api } from "../../api/api";

/*
==============================
GET DOCTORS
==============================
*/

export const getDoctors = async () => {

  const res = await api.get("/doctors");
  return res.data;

};

/*
==============================
CREATE DOCTOR
==============================
*/

export const createDoctor = async (data: any) => {

  const res = await api.post("/doctors", data);
  return res.data;

};

/*
==============================
UPDATE DOCTOR
==============================
*/

export const updateDoctor = async (id: string, data: any) => {

  const res = await api.put(`/doctors/${id}`, data);
  return res.data;

};

/*
==============================
DELETE DOCTOR
==============================
*/

export const deleteDoctor = async (id: string) => {

  const res = await api.delete(`/doctors/${id}`);
  return res.data;

};