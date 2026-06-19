export type AuthRole = 'admin' | 'manager' | 'mr' | 'doctor' | 'distributor';

export type AuthUser = {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: AuthRole;
  companyId: string;
  tenantId: string;
  companyCode: string;
  isActive: boolean;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  profileImage?: string;
  geoLocation?: {
    type: string;
    coordinates: [number, number];
  };
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type LoginPayload = {
  username: string;
  password: string;
  companyCode?: string;
};

export type LoginResponse = {
  success: boolean;
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
};

export type RefreshTokenResponse = {
  success: boolean;
  token: string;
  refreshToken?: string;
  expiresIn: number;
};
