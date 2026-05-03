import { Doctor } from "./doctorTypes";

/*
========================================
FORMAT DOCTOR NAME
========================================
*/

export const formatDoctorName = (doctor: Doctor) => {

  if (!doctor?.name) return "Unknown Doctor";

  if (doctor.name.toLowerCase().startsWith("dr")) {
    return doctor.name;
  }

  return `Dr. ${doctor.name}`;

};

/*
========================================
FORMAT DOCTOR LOCATION
========================================
*/

export const formatDoctorLocation = (doctor: Doctor) => {

  const parts = [
    doctor.city,
    doctor.state
  ].filter(Boolean);

  return parts.join(", ");

};

/*
========================================
MASK MOBILE NUMBER
========================================
*/

export const maskMobile = (mobile?: string) => {

  if (!mobile) return "";

  if (mobile.length < 6) return mobile;

  return mobile.slice(0, 3) + "****" + mobile.slice(-3);

};

/*
========================================
SEARCH DOCTORS
========================================
*/

export const searchDoctors = (

  doctors: Doctor[],
  query: string

) => {

  if (!query) return doctors;

  const q = query.toLowerCase();

  return doctors.filter((doc) =>

    doc.name?.toLowerCase().includes(q) ||
    doc.mobile?.includes(q) ||
    doc.specialization?.toLowerCase().includes(q) ||
    doc.city?.toLowerCase().includes(q)

  );

};

/*
========================================
SORT DOCTORS
========================================
*/

export const sortDoctorsByName = (

  doctors: Doctor[]

) => {

  return [...doctors].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

};