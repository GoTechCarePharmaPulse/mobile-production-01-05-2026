export type OrderStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export type OrderItem = {
  productId: string;
  productName?: string;
  quantity: number;
  rate: number;
  amount: number;
  batchNumber?: string;
};

export type Order = {
  _id?: string;
  id?: string;
  orderNumber?: string;
  mrId: string;
  doctorId: string;
  companyId: string;
  tenantId: string;
  items: OrderItem[];
  totalAmount: number;
  totalQuantity: number;
  status: OrderStatus;
  paymentMode?: 'CASH' | 'CREDIT' | 'CHEQUE' | 'NEFT';
  deliveryDate?: string | Date;
  notes?: string;
  remarks?: string;
  approvedBy?: string;
  approvalDate?: string | Date;
  rejectionReason?: string;
  visitId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderPayload = {
  doctorId: string;
  items: OrderItem[];
  paymentMode?: string;
  notes?: string;
  visitId?: string;
};

export type UpdateOrderPayload = Partial<Omit<CreateOrderPayload, 'doctorId'>>;

export type ApproveOrderPayload = {
  approvalDate?: string;
};

export type RejectOrderPayload = {
  rejectionReason: string;
};

export type OrderDashboard = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  totalValue: number;
};
