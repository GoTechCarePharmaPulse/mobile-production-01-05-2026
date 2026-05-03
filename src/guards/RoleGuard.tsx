import { useAuth } from "@/src/context/AuthContext";
import { hasRole } from "@/src/utils/rbac";
import { View, Text } from "react-native";

const RoleGuard = ({ children }) => {
  return children; // ✅ bypass role check
};

export default RoleGuard;