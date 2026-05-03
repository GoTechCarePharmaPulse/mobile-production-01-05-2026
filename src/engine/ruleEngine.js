export const evaluateRules = (field, values) => {
  if (!field.showIf) return true;

  const rule = field.showIf;
  const value = values[rule.field];

   // ✅ EQUALS
  if (rule.equals !== undefined) return value === rule.equals;

   // ✅ IN (ARRAY SUPPORT)
  if (rule.in) return rule.in.includes(value);

   // ✅ NOT EQUAL
  if (rule.notEquals !== undefined) return value !== rule.notEquals;

  // ✅ EXISTS
  if (rule.exists) return value !== undefined && value !== "";

  return true;
};

// 🚀 NEW: ACTION ENGINE
export const applyRules = (schema, values) => {
  let updated = { ...values };

  schema.forEach((field) => {
    if (!field.rules) return;

    field.rules.forEach((rule) => {
      const fieldValue = updated[rule.if.field];

      let condition = false;

      if (rule.if.equals !== undefined) {
        condition = fieldValue === rule.if.equals;
      }

      if (rule.if.in) {
        condition = rule.if.in.includes(fieldValue);
      }

      if (condition && rule.then.setValue !== undefined) {
        updated[field.name] = rule.then.setValue;
      }
    });
  });

  return updated;
};