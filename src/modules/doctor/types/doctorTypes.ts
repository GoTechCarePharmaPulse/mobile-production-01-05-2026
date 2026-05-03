/*
========================================
DOCTOR CORE TYPE
========================================
*/

export interface Doctor {

  _id?: string;

  name: string;

  specialization?: string;

  hospital?: string;

  clinic?: string;

  mobile?: string;

  email?: string;

  address?: string;

  city?: string;

  state?: string;

  pincode?: string;

  companyId?: string;

  createdAt?: string;

  updatedAt?: string;

}

/*
========================================
CREATE DOCTOR REQUEST
========================================
*/

export interface CreateDoctorPayload {

  name: string;

  specialization?: string;

  hospital?: string;

  clinic?: string;

  mobile?: string;

  email?: string;

  address?: string;

  city?: string;

  state?: string;

  pincode?: string;

}

/*
========================================
UPDATE DOCTOR REQUEST
========================================
*/

export interface UpdateDoctorPayload {

  name?: string;

  specialization?: string;

  hospital?: string;

  clinic?: string;

  mobile?: string;

  email?: string;

  address?: string;

  city?: string;

  state?: string;

  pincode?: string;

}

/*
========================================
DOCTOR API RESPONSE
========================================
*/

export interface DoctorResponse {

  success?: boolean;

  message?: string;

  doctor?: Doctor;

  doctors?: Doctor[];

}