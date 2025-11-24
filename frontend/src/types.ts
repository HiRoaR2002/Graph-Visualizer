export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  paymentMethods?: string[] | null;
};

export type Transaction = {
  id: string;
  amount?: number;
  timestamp?: number;
  ip?: string | null;
  deviceId?: string | null;
  metadata?: Record<string, any> | null;
};

export type GraphNode = {
  id: string;
  label: string;
  type: "User" | "Transaction" | string;
  props?: Record<string, any>;
};

export type GraphRel = {
  from: string;
  to: string;
  type: string; // e.g., "SENT", "RECEIVED_BY", "SAME_IP", "SAME_DEVICE", "SHARED_ATTRIBUTE", "DIRECT"
};

export type GraphResponse = {
  nodes: GraphNode[];
  relationships: GraphRel[];
};
