import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: {
      type: String,
      trim: true,
    },

    line2: {
      type: String,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
    },

    area: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },

    pincode: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

export default addressSchema;