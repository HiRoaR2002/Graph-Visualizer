import React, { useEffect, useState, useMemo, useCallback } from "react";
import { fetchTransactions } from "../api";
import type { Transaction } from "../types";

export default function TransactionList({
  onSelect,
}: {
  onSelect: (t: Transaction) => void;
}) {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [ipFilter, setIpFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(1000)
      .then(setTxs)
      .catch((err) => {
        setError(err.message || "Failed to load transactions");
      })
      .finally(() => setLoading(false));
  }, []);

  const { ips, devices } = useMemo(() => {
    const ips = Array.from(
      new Set(txs.map((t) => t.ip).filter(Boolean))
    ) as string[];
    const devices = Array.from(
      new Set(txs.map((t) => t.deviceId).filter(Boolean))
    ) as string[];
    return { ips, devices };
  }, [txs]);

  const filtered = useMemo(() => {
    return txs.filter((t) => {
      const s = search.toLowerCase();
      if (search && !t.id.toLowerCase().includes(s)) return false;
      if (ipFilter && t.ip !== ipFilter) return false;
      if (deviceFilter && t.deviceId !== deviceFilter) return false;
      return true;
    });
  }, [txs, search, ipFilter, deviceFilter]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setIpFilter("");
    setDeviceFilter("");
  }, []);

  const hasActiveFilters = search || ipFilter || deviceFilter;

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <div className="text-gray-500">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <span className="text-sm text-gray-600">
          {filtered.length} of {txs.length}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={ipFilter}
          onChange={(e) => setIpFilter(e.target.value)}
          aria-label="Filter by IP address"
        >
          <option value="">All IPs</option>
          {ips.map((ip) => (
            <option key={ip} value={ip}>
              {ip}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          aria-label="Filter by device"
        >
          <option value="">All Devices</option>
          {devices.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto border rounded bg-gray-50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {txs.length === 0
              ? "No transactions found"
              : "No transactions match your filters"}
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelect(t)}
                className="p-3 bg-white hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-sm truncate">{t.id}</div>
                  {(t.ip || t.deviceId) && (
                    <div className="text-xs text-gray-500 mt-1 flex gap-3">
                      {t.ip && <span>IP: {t.ip}</span>}
                      {t.deviceId && <span>Device: {t.deviceId}</span>}
                    </div>
                  )}
                </div>
                <span className="font-semibold text-gray-900 whitespace-nowrap">
                  ₹{t.amount && t.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
