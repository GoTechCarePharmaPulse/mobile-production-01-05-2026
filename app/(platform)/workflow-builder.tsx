import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background
} from "reactflow";
import "reactflow/dist/style.css";

import { View, Button, Text, TextInput } from "react-native";
import api from "@/src/api/api";

export default function WorkflowBuilder() {

  const [nodes, setNodes] = useState([
    {
      id: "1",
      position: { x: 100, y: 100 },
      data: {
        label: "Manager Approval",
        approvers: ["manager"],
        parallel: false,
        requiredApprovals: 1,
        condition: {}
      },
      type: "input"
    }
  ]);

  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  // ✅ SAVE WORKFLOW
  const saveWorkflow = async () => {
    const steps = nodes.map((node) => ({
      label: node.data.label,
      approvers: node.data.approvers || [],
      parallel: node.data.parallel || false,
      requiredApprovals: node.data.requiredApprovals || 1,
      condition: node.data.condition || {}
    }));

    try {
      await api.post("/workflow/builder", {
        name: "Approval Flow",
        module: "orders",
        steps
      });

      alert("Workflow Saved 🚀");

    } catch (err) {
      console.log("SAVE ERROR:", err);
    }
  };

  return (
    <View style={{ flex: 1 }}>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>

      {/* 🔥 CONFIG PANEL */}
      {selectedNode && (
        <View style={{ padding: 10, backgroundColor: "#fff" }}>

          <Text>Node Config</Text>

          {/* LABEL */}
          <TextInput
            placeholder="Label"
            value={selectedNode.data.label}
            onChangeText={(val) => {
              const updated = nodes.map((n) =>
                n.id === selectedNode.id
                  ? { ...n, data: { ...n.data, label: val } }
                  : n
              );
              setNodes(updated);
            }}
          />

          {/* APPROVERS */}
          <TextInput
            placeholder="Approvers (manager,finance)"
            onChangeText={(val) => {
              const roles = val.split(",");

              const updated = nodes.map((n) =>
                n.id === selectedNode.id
                  ? {
                      ...n,
                      data: { ...n.data, approvers: roles }
                    }
                  : n
              );

              setNodes(updated);
            }}
          />

          {/* CONDITION FIELD */}
          <TextInput
            placeholder="Condition Field (amount)"
            onChangeText={(val) => {
              const updated = nodes.map((n) =>
                n.id === selectedNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        condition: {
                          ...n.data.condition,
                          field: val
                        }
                      }
                    }
                  : n
              );
              setNodes(updated);
            }}
          />

          {/* CONDITION OPERATOR */}
          <TextInput
            placeholder="Operator (>, <, ==)"
            onChangeText={(val) => {
              const updated = nodes.map((n) =>
                n.id === selectedNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        condition: {
                          ...n.data.condition,
                          operator: val
                        }
                      }
                    }
                  : n
              );
              setNodes(updated);
            }}
          />

          {/* CONDITION VALUE */}
          <TextInput
            placeholder="Value (50000)"
            onChangeText={(val) => {
              const updated = nodes.map((n) =>
                n.id === selectedNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        condition: {
                          ...n.data.condition,
                          value: Number(val)
                        }
                      }
                    }
                  : n
              );
              setNodes(updated);
            }}
          />

          {/* PARALLEL TOGGLE */}
          <Button
            title="Toggle Parallel"
            onPress={() => {
              const updated = nodes.map((n) =>
                n.id === selectedNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        parallel: !n.data.parallel
                      }
                    }
                  : n
              );
              setNodes(updated);
            }}
          />

        </View>
      )}

      <Button title="Save Workflow" onPress={saveWorkflow} />

    </View>
  );
}