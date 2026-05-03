import Map from "../../components/maps/Map";

export default function TerritoryHeatmap(){

  const [markers,setMarkers]=useState([]);

  useEffect(()=>{

    fetch("/api/territory/heatmap")
      .then(r=>r.json())
      .then(setMarkers);

  },[]);

  return <Map markers={markers} />;

}