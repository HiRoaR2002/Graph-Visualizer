import axios from "axios";
import type { User, Transaction, GraphResponse } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function fetchUsers(limit = 200, skip = 0): Promise<User[]> {
  const res = await axios.get<User[]>(`${BASE}/users`, {
    params: { limit, skip },
  });
  return res.data;
}

export async function fetchTransactions(
  limit = 200,
  skip = 0
): Promise<Transaction[]> {
  const res = await axios.get<Transaction[]>(`${BASE}/transactions`, {
    params: { limit, skip },
  });
  return res.data;
}

export async function fetchUserGraph(id: string): Promise<GraphResponse> {
  const res = await axios.get<GraphResponse>(
    `${BASE}/relationships/user/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function fetchTransactionGraph(
  id: string
): Promise<GraphResponse> {
  const res = await axios.get<GraphResponse>(
    `${BASE}/relationships/transaction/${encodeURIComponent(id)}`
  );
  return res.data;
}
