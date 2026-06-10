import type { ReactNode } from "react";

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

const RoleGuard = ({ children }: RoleGuardProps) => {
  return <>{children}</>;
};

export default RoleGuard;
