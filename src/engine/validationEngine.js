export const validateForm = (schema, values) => {
  const errors = {};

  schema.forEach((field) => {
    const value = values[field.name];

    // ✅ REQUIRED
    if (field.required && (!value || value === "")) {
      errors[field.name] = `${field.label} is required`;
      return;
    }

    // ✅ MIN LENGTH
    if (field.minLength && value?.length < field.minLength) {
      errors[field.name] = `${field.label} must be at least ${field.minLength} characters`;
    }

     // ✅ EMAIL VALIDATION
    if (field.type === "email" && value) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(value)) {
        errors[field.name] = `Invalid email format`;
      }
    }

    if (field.type === "email" && value) {
      if (!value.includes("@")) {
        errors[field.name] = "Invalid email";
      }
    }

     if (field.name === "clinicLocation" && values.role === "doctor") {
  if (!values.clinicLocation) {
    errors.clinicLocation = "Clinic location is required for doctor";
  }
}

     // ✅ CUSTOM VALIDATION
    if (field.validate) {
      const error = field.validate(value, values);
      if (error) {
        errors[field.name] = error;
      }
    }
  });

  return errors;
};