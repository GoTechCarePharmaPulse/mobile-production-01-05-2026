import { useEffect, useState } from "react";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from "./doctorService";

/*
========================================
GET DOCTORS HOOK
========================================
*/

export const useDoctors = () => {

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchDoctors = async () => {

    try {

      setLoading(true);

      const data = await getDoctors();

      setDoctors(data?.doctors || data || []);

    } catch (err) {

      console.log("Doctor fetch error:", err);
      setError(err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctors
  };

};

/*
========================================
CREATE DOCTOR HOOK
========================================
*/

export const useCreateDoctor = () => {

  const [loading, setLoading] = useState(false);

  const addDoctor = async (data: any) => {

    try {

      setLoading(true);

      const res = await createDoctor(data);

      return res;

    } catch (err) {

      console.log("Create doctor error:", err);
      throw err;

    } finally {

      setLoading(false);

    }

  };

  return { addDoctor, loading };

};

/*
========================================
UPDATE DOCTOR HOOK
========================================
*/

export const useUpdateDoctor = () => {

  const [loading, setLoading] = useState(false);

  const editDoctor = async (id: string, data: any) => {

    try {

      setLoading(true);

      const res = await updateDoctor(id, data);

      return res;

    } catch (err) {

      console.log("Update doctor error:", err);
      throw err;

    } finally {

      setLoading(false);

    }

  };

  return { editDoctor, loading };

};

/*
========================================
DELETE DOCTOR HOOK
========================================
*/

export const useDeleteDoctor = () => {

  const [loading, setLoading] = useState(false);

  const removeDoctor = async (id: string) => {

    try {

      setLoading(true);

      const res = await deleteDoctor(id);

      return res;

    } catch (err) {

      console.log("Delete doctor error:", err);
      throw err;

    } finally {

      setLoading(false);

    }

  };

  return { removeDoctor, loading };

};