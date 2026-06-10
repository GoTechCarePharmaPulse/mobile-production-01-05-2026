import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import Tabs from "@/src/components/ui/Tabs";
import LocationPicker from "@/src/components/maps/LocationPicker";


import { useAuth } from "@/src/context/AuthContext";
import { evaluateRules, applyRules } from "@/src/engine/ruleEngine";
import { api } from "@/src/api/api";

const deepClone = (value: any): any => {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }

  const cloned: any = {};

  Object.keys(value).forEach((key) => {
    cloned[key] = deepClone(value[key]);
  });

  return cloned;
};

export default function FormRenderer({
  schema = [],
  values = {},
  setValues,
  mode = "create",
}: any) {
  const { user } = useAuth() || {};

  const [localSchema, setLocalSchema] = useState(schema);
  const [activeTab, setActiveTab] = useState("general");

  // =====================================================
  // HELPERS
  // =====================================================

  const getNestedValue = useCallback(
    (obj: any, path: string) => {
      if (!obj || !path) return undefined;

      return path
        .split(".")
        .reduce((acc, part) => acc?.[part], obj);
    },
    []
  );

  const setNestedValue = useCallback(
    (obj: any, path: string, value: any) => {
      const keys = path.split(".");
      const lastKey = keys.pop();

      const newObj = deepClone(obj || {});

      let current = newObj;

      keys.forEach((key) => {
        if (!current[key]) {
          current[key] = {};
        }

        current = current[key];
      });

      if (lastKey) {
        current[lastKey] = value;
      }

      return newObj;
    },
    []
  );

  // =====================================================
  // APPLY RULES
  // =====================================================

  useEffect(() => {
    if (!schema?.length) return;

    const updates = applyRules(schema, values);

    if (!updates || Object.keys(updates).length === 0) {
      return;
    }

    setValues((prev: any) => {
      let changed = false;

      const next = { ...prev };

      Object.entries(updates).forEach(([key, value]) => {
        if (prev[key] !== value) {
          next[key] = value;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [schema]);

  // =====================================================
  // LOAD SELECT OPTIONS
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        const updated = await Promise.all(
          schema.map(async (field: any) => {
            if (
              field.type === "select" &&
              field.api
            ) {
              try {
                const res = await api.get(field.api);

                const list =
                  res.data?.users ||
                  res.data ||
                  [];

                return {
                  ...field,
                  options: list.map((u: any) => ({
                    label:
                      `${u.firstName || ""} ${u.lastName || ""}`.trim(),
                    value: u._id,
                  })),
                };
              } catch (err) {
                console.log(
                  "Failed loading select:",
                  field.name
                );

                return {
                  ...field,
                  options: [],
                };
              }
            }

            return field;
          })
        );

        if (mounted) {
          setLocalSchema(updated);
        }
      } catch (err) {
        console.log("Schema load error", err);
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, [schema]);

  // =====================================================
  // SECTIONS
  // =====================================================

  const sections = useMemo(() => {
    return [
      ...new Set(
        localSchema.map(
          (f: any) => f.section || "general"
        )
      ),
    ];
  }, [localSchema]);

  useEffect(() => {
    if (sections.length > 0) {
      setActiveTab(sections[0]);
    }
  }, [sections]);

  // =====================================================
  // PERMISSIONS
  // =====================================================

  const canView = useCallback(
    (field: any) => {
      if (!field.permissions?.view) return true;

      const perms = Array.isArray(
        field.permissions.view
      )
        ? field.permissions.view
        : [field.permissions.view];

      return perms.some((p) =>
        user?.permissions?.includes(p)
      );
    },
    [user]
  );

  const canEdit = useCallback(
    (field: any) => {
      if (field.editable === false) {
        return false;
      }

      if (
        field.name === "newPassword" &&
        values.mustResetPassword
      ) {
        return true;
      }

      if (!field.permissions?.edit) {
        return true;
      }

      const perms = Array.isArray(
        field.permissions.edit
      )
        ? field.permissions.edit
        : [field.permissions.edit];

      return perms.some((p) =>
        user?.permissions?.includes(p)
      );
    },
    [user, values.mustResetPassword]
  );

  // =====================================================
  // FIELD VISIBILITY
  // =====================================================

  const visibleFields = useMemo(() => {
    return localSchema.filter((field: any) => {
      if (!canView(field)) {
        return false;
      }

      const correctTab =
        (field.section || "general") === activeTab;

      if (!correctTab) {
        return false;
      }

      const passesRules =
        evaluateRules?.(field, values) !== false;

      if (!passesRules) {
        return false;
      }

      if (!field.showIf) {
        return true;
      }

      if (typeof field.showIf === "function") {
        return field.showIf(values, mode);
      }

      if (typeof field.showIf === "object") {
        const {
          field: depField,
          equals,
          exists,
        } = field.showIf;

        const depValue = getNestedValue(
          values,
          depField
        );

        if (exists) {
          return !!depValue;
        }

        if (equals !== undefined) {
          return depValue === equals;
        }
      }

      return true;
    });
  }, [
    localSchema,
    activeTab,
    values,
    mode,
    canView,
    getNestedValue,
  ]);

  // =====================================================
  // UPDATE VALUE
  // =====================================================

  const updateValue = useCallback(
    (fieldName: string, value: any) => {
      setValues((prev: any) =>
        setNestedValue(prev, fieldName, value)
      );
    },
    [setValues, setNestedValue]
  );

  // =====================================================
  // RENDER FIELD
  // =====================================================

  const renderField = (field: any) => {
    const editable = canEdit(field);

    const value =
      getNestedValue(values, field.name) ?? "";

    const fieldOptions =
      field.name === "role" &&
      user?.role === "manager"
        ? (field.options || []).filter(
            (r: any) =>
              r.value === "mr" ||
              r.value === "doctor"
          )
        : field.options || [];

    // =====================================================
    // LABEL
    // =====================================================

    if (field.type === "label") {
      return (
        <Text
          key={field.name}
          style={styles.label}
        >
          {field.label}
        </Text>
      );
    }

    // =====================================================
    // TEXT
    // =====================================================

    if (
      field.type === "text" ||
      field.type === "email" ||
      field.type === "password"
    ) {
      return (
        <TextInput
          key={field.name}
          style={styles.input}
          placeholder={field.label}
          value={String(value)}
          editable={
            editable &&
            !(
              mode === "edit" &&
              field.name === "username"
            )
          }
          secureTextEntry={
            field.type === "password"
          }
          onChangeText={(text) =>
            updateValue(field.name, text)
          }
        />
      );
    }

    // =====================================================
    // BOOLEAN
    // =====================================================

    if (field.type === "boolean") {
      return (
        <View
          key={field.name}
          style={styles.switchContainer}
        >
          <Text>{field.label}</Text>

          <Switch
            value={!!value}
            disabled={!editable}
            onValueChange={(val) =>
              updateValue(field.name, val)
            }
          />
        </View>
      );
    }

    // =====================================================
    // SELECT
    // =====================================================

    if (field.type === "select") {
      if (field.multiple) {
        const selectedValues = Array.isArray(value)
          ? value
          : [];

        return (
          <View key={field.name}>
            <Text style={styles.selectLabel}>
              {field.label}
            </Text>

            {fieldOptions.map((item: any) => {
              const isSelected =
                selectedValues.includes(
                  item.value
                );

              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.multiItem,
                    isSelected &&
                      styles.multiSelected,
                  ]}
                  onPress={() => {
                    if (!editable) return;

                    let updated = [
                      ...selectedValues,
                    ];

                    if (isSelected) {
                      updated =
                        updated.filter(
                          (v) =>
                            v !== item.value
                        );
                    } else {
                      updated.push(item.value);
                    }

                    updateValue(
                      field.name,
                      updated
                    );
                  }}
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }

      return (
        <View
          key={field.name}
          style={{ marginBottom: 12 }}
        >
          <Text>{field.label}</Text>

          <Picker
            enabled={editable}
            selectedValue={value}
            onValueChange={(val) =>
              updateValue(field.name, val)
            }
          >
            <Picker.Item
              label="Select"
              value=""
            />

            {fieldOptions.map((item: any) => (
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

    // =====================================================
    // BUTTON
    // =====================================================

    if (field.type === "button") {
      return (
        <TouchableOpacity
          key={field.name}
          style={styles.button}
          onPress={() => {
            setValues((prev: any) => ({
              ...prev,
              mustResetPassword: true,
            }));

            Alert.alert(
              "Success",
              "Password reset enabled"
            );
          }}
        >
          <Text style={styles.buttonText}>
            {field.label}
          </Text>
        </TouchableOpacity>
      );
    }

    // =====================================================
    // LOCATION PICKER
    // =====================================================

    if (field.component === "LocationPicker") {
  const coordinates =
    values.geoLocation?.coordinates;

  return (
    <View
      key={field.name}
      style={{ marginBottom: 16 }}
    >
      <LocationPicker
        value={values.geoLocation}
        onSelect={(data: any) => {
          if (
            !data?.latitude ||
            !data?.longitude
          ) {
            return;
          }

          setValues((prev: any) => ({
            ...prev,

            geoLocation: {
              type: "Point",
              coordinates: [
                data.longitude,
                data.latitude,
              ],
            },

            address: {
              ...(prev.address || {}),

              line1: `${data.street || ""} ${data.landmark || ""}`.trim(),

              landmark:
                data.landmark || "",

              area:
                data.area || "",

              city:
                data.city || "",

              state:
                data.state || "",

              country:
                data.country || "",

              pincode:
                data.postalCode || "",
            },
          }));
        }}
      />

      {coordinates?.length === 2 && (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            backgroundColor: "#f8fafc",
            borderWidth: 1,
            borderColor: "#cbd5e1",
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              marginBottom: 6,
            }}
          >
            Saved Location
          </Text>

          <Text>
            Latitude: {coordinates[1]}
          </Text>

          <Text>
            Longitude: {coordinates[0]}
          </Text>

          <Text>
            Address: {values.address?.line1 || "N/A"}
          </Text>
        </View>
      )}
    </View>
  );
}

return null;
}; 
  // UI
  // =====================================================

  return (
    <View style={styles.container}>
      <Tabs
        tabs={sections}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {visibleFields.map((field: any) =>
        renderField(field)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  label: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 10,
  },

  switchContainer: {
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  multiItem: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },

  multiSelected: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
  },

  selectLabel: {
    marginBottom: 8,
    fontWeight: "600",
  },
});