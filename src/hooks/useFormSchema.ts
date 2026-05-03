import { useEffect, useState } from "react";
import { api } from "@/src/api/api";

export const useFormSchema = (module) => {
  const [schema, setSchema] = useState([]);

  useEffect(() => {
    const fetchSchema = async () => {
      const res = await api.get(`/form-schemas/${module}`);
      setSchema(res.data.fields || []);
    };

    fetchSchema();
  }, [module]);

  return schema;
};