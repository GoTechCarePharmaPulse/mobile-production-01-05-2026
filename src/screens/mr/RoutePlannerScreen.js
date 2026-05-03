import Map from "../../components/maps/Map";

export default function RoutePlannerScreen(){

  const [markers,setMarkers] = useState([]);

  useEffect(()=>{

    fetch("/api/route/optimize")
      .then(r=>r.json())
      .then(data=>setMarkers(data));

  },[]);

  return <Map markers={markers} />;

}