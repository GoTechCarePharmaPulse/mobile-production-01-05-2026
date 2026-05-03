import React from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function DoctorNetworkGraph({data}){

  return(

    <ForceGraph2D
      graphData={data}
      nodeLabel="name"
      nodeAutoColorBy="group"
      linkDirectionalArrowLength={5}
    />

  );

}