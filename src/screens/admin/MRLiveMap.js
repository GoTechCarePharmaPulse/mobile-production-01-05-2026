import React, { useEffect, useState } from "react";
import UniversalMap from "../../components/maps/UniversalMap";
import { api } from "../../api/client";

export default function MRLiveMap() {

  const [locations, setLocations] = useState([]);

  useEffect(() => {

    loadMRLocations();

  }, []);

  const loadMRLocations = async () => {

    const res = await api.get("/tracking/mr-locations");

    setLocations(res.data);

  };

  return (

    <UniversalMap locations={locations} />

  );

}