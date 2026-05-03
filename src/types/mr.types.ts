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
