import { Bar } from "react-chartjs-2";

export default function DoctorInfluenceGraph({data}){

  const chartData = {

    labels:data.map(d=>d.doctor),

    datasets:[{
      label:"Influence Score",
      data:data.map(d=>d.score)
    }]

  };

  return <Bar data={chartData} />;

}