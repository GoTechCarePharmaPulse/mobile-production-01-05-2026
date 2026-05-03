import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";

export default function useRoleGuard(allowedRoles: string[]) {

  const auth = useAuth();
  const router = useRouter();

  if (!auth) return;

  const { user, loading } = auth;

  useEffect(() => {

    if (loading) return;

    if (!user) return;

    if (!allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
    }

  }, [user, loading]);

}