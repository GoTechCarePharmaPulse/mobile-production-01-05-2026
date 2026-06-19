export type UserRole = 'admin' | 'manager' | 'mr' | 'doctor' | 'distributor';

export type GeoLocation = {
  type: string;
  coordinates: [number, number];
};

export type User = {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  mobile: string;
  role: UserRole;
  companyId: string;
  tenantId: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  geoLocation?: GeoLocation;
  segment?: string;
  region?: string;
  specialization?: string;
  clinicName?: string;
  assignedDoctors?: string[];
  assignedWarehouses?: string[];
  riskScore?: number;
  prescriptionScore?: number;
  createdAt: string;
  updatedAt: string;
};

export type UserCreatePayload = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: UserRole;
  companyCode: string;
  segment?: string;
  specialization?: string;
  clinicName?: string;
};

export type UserUpdatePayload = Partial<UserCreatePayload>;
