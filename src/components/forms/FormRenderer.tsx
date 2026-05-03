import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import Tabs from "@/src/components/ui/Tabs";
import { useAuth } from "@/src/context/AuthContext";
import { evaluateRules, applyRules } from "@/src/engine/ruleEngine";
import LocationPicker from "@/src/components/maps/LocationPicker";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/api";

export default function FormRenderer({ schema, values, setValues, mode }) {
  const { user } = useAuth() || {};
  const [localSchema, setLocalSchema] = useState(
  JSON.parse(JSON.stringify(schema))
);


  // ===============================
  // RULES
  // ===============================
useEffect(() => {
  const updated = applyRules(schema, values);

  // prevent infinite loop
  const hasChanges = Object.keys(updated).some(
    (key) => values[key] !== updated[key]
  );

  if (hasChanges) {
    setValues((prev) => ({ ...prev, ...updated }));
  }
}, [values]); // ✅ correct dependency
  

 
  // ===============================
  // LOAD OPTIONS
  // ===============================
  useEffect(() => {
    const load = async () => {
      const updated = await Promise.all(
        localSchema.map(async (field) => {
          if (field.type === "select" && field.api) {
            try {
              const res = await api.get(field.api);
              const list = res.data?.users || res.data || [];

              return {
                ...field,
                options: list.map((u) => ({
                  label: `${u.firstName} ${u.lastName}`,
                  value: u._id,
                })),
              };
            } catch {
              return field;
            }
          }
          return field;
        })
      );
      setLocalSchema(updated);
    };
    load();
  }, []);

  // ===============================
  // TABS
  // ===============================
  const sections = [
    ...new Set(localSchema.map((f) => f.section || "general")),
  ];

  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (sections.length > 0) {
      setActiveTab(sections[0]);
    }
  }, [localSchema]);


    // ===============================
  // VALIDATION
  // ===============================
   const validate = () => {
  const errors = {};

  localSchema.forEach((field) => {
    if (field.required && !values[field.name]) {
      errors[field.name] = `${field.label} is required`;
    }
  });

  return errors;
};

  // ===============================
  // PERMISSIONS
  // ===============================
  const canView = (field) => {
    if (!field.permissions?.view) return true;

    const perms = Array.isArray(field.permissions.view)
      ? field.permissions.view
      : [field.permissions.view];

    return perms.some((p) => user?.permissions?.includes(p));
  };

  const canEdit = (field) => {
    if (!field.permissions?.edit) return true;

    const perms = Array.isArray(field.permissions.edit)
      ? field.permissions.edit
      : [field.permissions.edit];

    return perms.some((p) => user?.permissions?.includes(p));
  };

  // ===============================
  // FIELD RENDERER
  // ===============================
  const renderField = (field) => {
    if (!canView(field)) return null;

    // TEXT
    if (field.type === "text" || field.type === "email") {
      return (
        <TextInput
          key={field.name}
          placeholder={field.label}
          value={values?.[field.name] || ""}
          editable={canEdit(field)}
          onFocus={() => {
            if (!canEdit(field)) {
              Alert.alert("Permission Denied");
            }
          }}
          onChangeText={(t) => {
  if (!canEdit(field)) {
    Alert.alert("Permission Denied");
    return;
  }

  setValues({ ...values, [field.name]: t });
}}
          style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        />
      );
    }

    // SELECT (SINGLE)
    if (field.type === "select") {
      return (
        <View key={field.name} style={{ marginBottom: 10 }}>
          <Text>{field.label}</Text>

          <Picker
            selectedValue={values?.[field.name] ?? ""}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, [field.name]: val }))
            }
          >
            <Picker.Item label="Select" value="" />
            {(field.options || []).map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      );
    }

    // BOOLEAN
    if (field.type === "boolean") {
      return (
        <View key={field.name}>
          <Text>{field.label}</Text>
          <Switch
            value={values?.[field.name] ?? false}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, [field.name]: val }))
            }
          />
        </View>
      );
    }


    if (field.name === "role") {
  if (user?.role === "manager") {
    field.options = field.options.filter(
      (r) => r.value === "mr" || r.value === "doctor"
    );
  }
}


if (field.type === "button") {
  return (
    <TouchableOpacity
      key={field.name}
      onPress={() => {
        Alert.alert("Reset Password Triggered");
        setValues((prev) => ({
          ...prev,
          mustResetPassword: true
        }));
      }}
      style={{ padding: 10, backgroundColor: "#dc2626", marginBottom: 10 }}
    >
      <Text style={{ color: "#fff" }}>{field.label}</Text>
    </TouchableOpacity>
  );
}


    // LOCATION
    if (field.component === "LocationPicker") {
      return (
        <LocationPicker
          key={field.name}
          onSelect={(data) => {
            setValues((prev) => ({
              ...prev,
              clinicLocation: {
                latitude: data.latitude,
                longitude: data.longitude,
              },
	        landmark: data.landmark, // ✅ ADD
		area: data.area,        // ✅ ADD
                city: data.city,
                state: data.state,
    		clinicAddress: `${data.street || ""} ${data.landmark || ""}`, // ✅ ADD
            }));
          }}
        />
      );
    }

    return null;
  };

  // ===============================
  // FILTERED FIELDS ✅ ADD HERE
  // ===============================
  const visibleFields = localSchema.filter((f) => {
    const correctTab = (f.section || "general") === activeTab;
    const passesRules = evaluateRules?.(f, values) !== false;

    const passesMode = (() => {
  if (!f.showIf) return true;

  if (typeof f.showIf === "function") {
    return f.showIf(values, mode);
  }

  if (typeof f.showIf === "object") {
    const { field, equals, exists } = f.showIf;

    if (exists) return !!values[field];
    if (equals !== undefined) return values[field] === equals;
  }

  return true;
})();

  return correctTab && passesRules && passesMode && canView(f);
  });



  // ===============================
  // UI
  // ===============================
  return (
    <View>
      <Tabs
        tabs={sections}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {visibleFields.map((field) => renderField(field))}

      

    </View>
  );

  
}