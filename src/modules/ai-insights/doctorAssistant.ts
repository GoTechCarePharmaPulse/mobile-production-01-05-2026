import { api } from "@/src/api/api";

export const askDoctorAI = async (symptoms:string) => {

  try {

    const res = await api.post("/ai/doctor-assistant", {
      symptoms
    });

    return res.data;

  } catch (err) {

    console.log("AI doctor error", err);

    return {
      advice: "Unable to generate advice"
    };

  }

};
export function predictDoctorSales(visits){

 let score = visits * 0.8

 return score

};