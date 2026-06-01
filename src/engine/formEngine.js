export const createForm = (schema) => {
  return {
    schema,

    getInitialValues: () => {
      const values = {};

      schema.forEach((field) => {
        values[field.name] = "";
      });

      return values;
    },

    validate: (values) => {
      return validateForm(schema, values);
    },
  };
};

export const validateForm = (schema, values) => {
  const errors = {};

  schema.forEach((field) => {

     // Skip hidden fields
  if (field.showIf) {

    if (typeof field.showIf === "function") {
      const visible = field.showIf(
        values,
        values.mode || "edit"
      );

      if (!visible) return;
    }

    if (typeof field.showIf === "object") {

      if (
        field.showIf.equals !== undefined &&
        values[field.showIf.field] !==
          field.showIf.equals
      ) {
        return;
      }
    }
  }
    const value = values[field.name];

    // Required validation
    if (field.required && !value) {
      errors[field.name] =
        `${field.label} is required`;
    }

    // Min length validation
    if (
      field.minLength &&
      value &&
      value.length < field.minLength
    ) {
      errors[field.name] =
        `${field.label} must be at least ${field.minLength} characters`;
    }

    // Custom validation
    if (field.validate) {
      const customError =
        field.validate(value);

      if (customError) {
        errors[field.name] = customError;
      }
    }
  });

  return errors;
};