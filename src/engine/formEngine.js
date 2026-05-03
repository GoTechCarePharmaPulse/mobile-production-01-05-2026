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
  };
};
export const validateForm = (schema, values) => {
  const errors = {};

  Object.keys(schema).forEach((key) => {
    const field = schema[key];
    const value = values[key];

    if (field.required && !value) {
      errors[key] = `${field.label} is required`;
    }

    if (field.minLength && value?.length < field.minLength) {
      errors[key] = `${field.label} must be at least ${field.minLength} characters`;
    }
  });

  return errors;
};