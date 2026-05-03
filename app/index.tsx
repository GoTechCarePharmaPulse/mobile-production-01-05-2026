import { Redirect } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { getTenant } from "@/src/utils/tenantStorage";
import { useState, useEffect } from "react";

export default function Index() {
  const { user, loading } = useAuth();
  
   const [tenantChecked, setTenantChecked] = useState(false);
  const [hasTenant, setHasTenant] = useState(false);

  useEffect(() => {
    const checkTenant = async () => {
      const tenant = await getTenant();
      setHasTenant(!!tenant);
      setTenantChecked(true);
    };

    checkTenant();
  }, []);


  if (loading || !tenantChecked) return null;

  // 🚨 FIRST TIME → setup
  if (!hasTenant) {
    return <Redirect href="/(auth)/setup" />;
  }

  // 👤 Not logged in
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // ✅ Logged in
  return <Redirect href="/(tenant)/dashboard" />;
}