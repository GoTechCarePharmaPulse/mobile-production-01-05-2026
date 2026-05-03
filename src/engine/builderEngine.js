export const createBuilder = () => {
  const state = {
    schema: [],
  };

  return {
    addField: (field) => {
      state.schema.push(field);
      return state.schema;
    },

    removeField: (name) => {
      state.schema = state.schema.filter((f) => f.name !== name);
      return state.schema;
    },

    updateField: (name, updates) => {
      state.schema = state.schema.map((f) =>
        f.name === name ? { ...f, ...updates } : f
      );
      return state.schema;
    },

    getSchema: () => state.schema,
  };
};