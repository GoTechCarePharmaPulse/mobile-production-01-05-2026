import type { User } from './user';

export type VisitStatus = 'STARTED' | 'VISITED' | 'COMPLETED';

export type CheckLocation = {
  lat: number;
  lng: number;
};

export type GeoLocation = {
  type: string;
  coordinates: [number, number];
};

export type Visit = {
  _id?: string;
  id?: string;
  mrId: string;
  doctorId: string;
  companyId: string;
  tenantId: string;
  checkInLocation?: CheckLocation;
  checkOutLocation?: CheckLocation;
  location: GeoLocation;
  checkInTime?: string | Date;
  checkOutTime?: string | Date;
  startTime?: string | Date;
  endTime?: string | Date;
  notes?: string;
  prescription?: string;
  status: VisitStatus;
  remarks?: string;
  productsDiscussed?: string[];
  followUpDate?: string | Date;
  visitedAt?: string | Date;
  visitDate: string | Date;
  createdAt: string;
  updatedAt: string;
};

export type StartVisitPayload = {
  doctorId: string;
  lat: number;
  lng: number;
};

export type UpdateVisitProgressPayload = {
  notes?: string;
  prescription?: string;
  remarks?: string;
  productsDiscussed?: string[];
  followUpDate?: string;
};

export type EndVisitPayload = {
  lat: number;
  lng: number;
  notes?: string;
  remarks?: string;
};

export type VisitWithDetails = Visit & {
  mr?: User;
  doctor?: User;
};

export type VisitDashboard = {
  status: VisitStatus;
  count: number;
  mrId?: string;
  mrName?: string;
  doctorName?: string;
  visitId?: string;
};
