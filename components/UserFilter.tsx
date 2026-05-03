import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";

interface FilterRow {
  field: string;
  value: string;
}

export default function UserFilter({ onApply }) {
  const [filters, setFilters] = useState<FilterRow[]>([
    { field: "role", value: "" },
  ]);
  const [logic, setLogic] = useState<"AND" | "OR">("AND");

  const fields = [
    { label: "First Name", value: "firstName" },
    { label: "Last Name", value: "lastName" },
    { label: "Mobile", value: "mobile" },
    { label: "Email", value: "email" },
    { label: "Role", value: "role" },
    { label: "Status", value: "employmentStatus" },
  ];

  const updateFilter = (index: number, key: string, value: string) => {
    const updated = [...filters];
    updated[index][key] = value;
    setFilters(updated);
  };

  const addFilterRow = () => {
    setFilters([...filters, { field: "", value: "" }]);
  };

  const removeFilterRow = (index: number) => {
    const updated = filters.filter((_, i) => i !== index);
    setFilters(updated);
  };

  const handleApply = () => {
    const validFilters = filters.filter(
      (f) => f.field && f.value
    );

    onApply(validFilters, logic);
  };

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={{ fontWeight: "600", marginBottom: 8 }}>
        Advanced Filter
      </Text>

      {/* AND / OR Selector */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {["AND", "OR"].map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => setLogic(l as "AND" | "OR")}
            style={{
              padding: 6,
              marginRight: 10,
              backgroundColor:
                logic === l ? "#1e40af" : "#e5e7eb",
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                color: logic === l ? "#fff" : "#000",
              }}
            >
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Rows */}
      {filters.map((filter, index) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Picker
            selectedValue={filter.field}
            style={{ flex: 1 }}
            onValueChange={(val) =>
              updateFilter(index, "field", val)
            }
          >
            <Picker.Item label="Select Field" value="" />
            {fields.map((f) => (
              <Picker.Item
                key={f.value}
                label={f.label}
                value={f.value}
              />
            ))}
          </Picker>

          <TextInput
            placeholder="Enter value"
            value={filter.value}
            onChangeText={(val) =>
              updateFilter(index, "value", val)
            }
            style={{
              flex: 1,
              borderWidth: 1,
              marginHorizontal: 8,
              padding: 6,
              borderRadius: 4,
            }}
          />

          {filters.length > 1 && (
            <TouchableOpacity
              onPress={() => removeFilterRow(index)}
              style={{
                padding: 6,
                backgroundColor: "#dc2626",
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff" }}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Add Filter Button */}
      <TouchableOpacity
        onPress={addFilterRow}
        style={{
          backgroundColor: "#6b7280",
          padding: 6,
          borderRadius: 6,
          marginBottom: 8,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: "#fff" }}>+ Add Condition</Text>
      </TouchableOpacity>

      {/* Apply Button */}
      <TouchableOpacity
        onPress={handleApply}
        style={{
          backgroundColor: "#1e40af",
          padding: 8,
          borderRadius: 6,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: "#fff" }}>Apply Filter</Text>
      </TouchableOpacity>
    </View>
  );
}