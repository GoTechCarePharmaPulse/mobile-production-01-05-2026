export type Doctor = {
  id: string;
  name: string;
  mobile: string;

  degree: string;
  specialist: string;

  clinicName: string;
  clinicAddress: string;

  // 📍 Location
  latitude: number;
  longitude: number;

  assignedMrId?: string; // ONE MR ONLY
};

class DoctorStore {
  private doctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Amit",
      mobile: "9999999999",
      degree: "MBBS",
      specialist: "Physician",
      clinicName: "Amit Clinic",
      clinicAddress: "MG Road, Pune",
      latitude: 18.5204,
      longitude: 73.8567,
    },
    {
      id: "2",
      name: "Dr. Ravi",
      mobile: "8888888888",
      degree: "MD",
      specialist: "Cardiologist",
      clinicName: "Ravi Heart Care",
      clinicAddress: "Baner Road, Pune",
      latitude: 18.559,
      longitude: 73.779,
    },
  ];

  getAll() {
    return this.doctors;
  }

  getByMr(mrId: string) {
    return this.doctors.filter(d => d.assignedMrId === mrId);
  }

  getUnassigned() {
    return this.doctors.filter(d => !d.assignedMrId);
  }

  assignDoctor(doctorId: string, mrId: string) {
    this.doctors = this.doctors.map(d =>
      d.id === doctorId
        ? { ...d, assignedMrId: mrId }
        : d
    );
  }

  unassignDoctor(doctorId: string) {
    this.doctors = this.doctors.map(d =>
      d.id === doctorId
        ? { ...d, assignedMrId: undefined }
        : d
    );
  }
}

export const doctorStore = new DoctorStore();
