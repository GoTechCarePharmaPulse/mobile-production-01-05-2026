import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { label: "Start" },
  },
];

const createNode = (id) => ({
  id,
  position: { x: Math.random() * 300, y: Math.random() * 300 },
  data: {
    label: (
      <div>
        <strong>Step {id}</strong>
        <select
          onChange={(e) => {
            const role = e.target.value;
            setNodes((nds) =>
              nds.map((n) =>
                n.id === id
                  ? { ...n, data: { ...n.data, role } }
                  : n
              )
            );
          }}
        >
          <option value="manager">Manager</option>
	  <option value="distributor">Distributor</option>
          <option value="admin">Admin</option>
          <option value="mr">MR</option>
	
        </select>
      </div>
    ),
    role: "manager",
  },
});

const newNode = {
  id: (nodes.length + 1).toString(),
  position: { x: 150, y: 150 },
  data: {
    label: `Step ${nodes.length}`,
    role: "manager",
    status: "pending",
  },
};
const getNodeStyle = (status) => ({
  padding: 10,
  borderRadius: 10,
  backgroundColor:
    status === "approved"
      ? "#22c55e"
      : status === "rejected"
      ? "#ef4444"
      : "#f59e0b",
});
const nodeTypes = {
  custom: ({ data }) => {
    return (
      <div style={{ padding: 10, background: "#fff", borderRadius: 8 }}>
        <strong>{data.label}</strong>

        <select
          value={data.role}
          onChange={(e) => (data.role = e.target.value)}
        >
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
          <option value="mr">MR</option>
        </select>
      </div>
    );
  },
};
const initialEdges = [];
export const transformToSteps = (nodes) => {
  return nodes.map((n, index) => ({
    step: index,
    role: n.data.role || "manager",
    label: n.data.label,
  }));
};
export default function WorkflowCanvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // 🔗 CONNECT NODES
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  // ➕ ADD STEP
  const addStep = () => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      position: {
        x: Math.random() * 250,
        y: Math.random() * 250,
      },
      data: { label: `Step ${nodes.length}` },
    };

    setNodes([...nodes, newNode]);
  };

  
  return (
    <div style={{ height: 500 }}>
      <button onClick={addStep}>➕ Add Step</button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
	nodeTypes={nodeTypes}
        onConnect={onConnect}
        fitView
	
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}