import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useSegments, usePathname, useRouter } from "expo-router";

export function useAuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // ✅ IMPORTANT: wait for auth init

    const publicRoutes = [
      "/login",
      "/setup",
      "/verify-otp",
      "/forgot-password",
    ];

    // ✅ safer route matching (exact + startsWith)
    const isPublicRoute = publicRoutes.some((route) =>
      pathname === route || pathname.startsWith(route)
    );

    console.log("AUTH GUARD:", {
      user: user?.role,
      route: pathname,
      group: segments?.[0],
    });

    if (!user && !isPublicRoute) {
      router.replace("/(auth)/login");
    }
  }, [user, loading, pathname]);
}