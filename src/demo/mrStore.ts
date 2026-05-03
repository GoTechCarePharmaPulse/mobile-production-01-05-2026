export type MR = {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  area: string;
  city: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

class MRStore {
  private mrs: MR[] = [];

  getAll() {
    return this.mrs;
  }

  getById(id: string) {
    return this.mrs.find(mr => mr.id === id);
  }

  add(mr: MR) {
    this.mrs.push(mr);
  }

  update(id: string, payload: Partial<MR>) {
    this.mrs = this.mrs.map(mr =>
      mr.id === id ? { ...mr, ...payload } : mr
    );
  }

  toggleStatus(id: string) {
    this.mrs = this.mrs.map(mr =>
      mr.id === id
        ? { ...mr, status: mr.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
        : mr
    );
  }
}

export const mrStore = new MRStore();
