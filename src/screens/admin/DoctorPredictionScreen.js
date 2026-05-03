export default function DoctorPredictionScreen(){

  const [prediction,setPrediction]=useState(null);

  const predict=async()=>{

    const r = await fetch("/api/predict?visits=10");

    const d = await r.json();

    setPrediction(d.prediction);

  }

}