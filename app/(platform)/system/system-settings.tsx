import { View, Text, Switch, Button } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@/src/api/api";
import { useTheme } from "@/src/context/ThemeContext";

export default function SystemSettings() {
  const [config, setConfig] = useState(null);
  const { dark, toggleTheme } = useTheme();

<TouchableOpacity
  onPress={toggleTheme}
  style={{
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
  }}
>
  <Text style={{ color: "#fff" }}>
    Switch to {dark ? "Light" : "Dark"} Mode
  </Text>
</TouchableOpacity>

  useEffect(() => {
    api.get("/system").then((res) => setConfig(res.data));
  }, []);

  const update = () => {
    api.patch("/system", config);
  };

  if (!config) return null;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        System Feature Toggle
      </Text>

      <View>
        <Text>Doctor Module</Text>
        <Switch
          value={config.doctorModule}
          onValueChange={(v) =>
            setConfig({ ...config, doctorModule: v })
          }
        />
      </View>

      <View>
        <Text>Distributor Module</Text>
        <Switch
          value={config.distributorModule}
          onValueChange={(v) =>
            setConfig({ ...config, distributorModule: v })
          }
        />
      </View>

      <Button title="Save Changes" onPress={update} />
    </View>
  );
}
