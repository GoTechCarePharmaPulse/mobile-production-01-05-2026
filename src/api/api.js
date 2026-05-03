import client from "./client";

// =============================
// AUTH APIs (SINGLE SOURCE)
// =============================
export const platformLoginApi = (data) =>
  client.post("/auth/platform/login", data);

export const tenantLoginApi = (data) =>
  client.post("/auth/tenant/login", data);

export const registerApi = (data) =>
  client.post("/auth/register", data);

export const verifyOtpApi = (data) =>
  client.post("/auth/verify-otp", data);

export const resendOtpApi = (data) =>
  client.post("/auth/resend-otp", data);

// =============================
// USER APIs
// =============================
export const getMeApi = () => client.get("/auth/me");

// =============================
// BACKWARD COMPATIBILITY (OPTIONAL)
// =============================
export { client as api };


