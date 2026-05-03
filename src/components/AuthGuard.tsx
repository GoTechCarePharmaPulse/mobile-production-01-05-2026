import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";
    const inPlatform = segments[0] === "(platform)";
    const inTenant = segments[0] === "(tenant)";
  

    console.log("AUTH GUARD:", {
      route: segments.join("/"),
      user: user?.role,
    });


    // ❌ Not logged in
    if (!user && !inAuth) {
      router.replace("/login");
      return;
    }

    // ✅ Logged in
    if (user) {
      if (user.role === "super_admin") {
        if (!inPlatform) router.replace("/(platform)/dashboard");
      } else {
        if (!inTenant) router.replace("/(tenant)/dashboard");
      }
    }
  }, [user, loading, segments]); // ✅ FIXED

  if (loading) return null;

  return children;
}