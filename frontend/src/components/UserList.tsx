import React, { useEffect, useState, useMemo, useCallback } from "react";
import { fetchUsers } from "../api";
import type { User } from "../types";

type FilterType = "all" | "email" | "phone" | "address";

export default function UserList({
  onSelect,
}: {
  onSelect: (u: User) => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchUsers(1000)
      .then(setUsers)
      .catch((err) => {
        setError(err.message || "Failed to load users");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return users;

    return users.filter((u) => {
      if (filter === "email") return (u.email ?? "").toLowerCase().includes(s);
      if (filter === "phone") return (u.phone ?? "").includes(s);
      if (filter === "address")
        return (u.address ?? "").toLowerCase().includes(s);

      return (
        u.id.toLowerCase().includes(s) ||
        (u.email ?? "").toLowerCase().includes(s) ||
        (u.phone ?? "").includes(s) ||
        (u.address ?? "").toLowerCase().includes(s)
      );
    });
  }, [users, search, filter]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilter("all");
  }, []);

  const hasActiveFilters = search.trim() !== "" || filter !== "all";

  const getFilterPlaceholder = () => {
    switch (filter) {
      case "email":
        return "Search by email...";
      case "phone":
        return "Search by phone...";
      case "address":
        return "Search by address...";
      default:
        return "Search by ID, email, phone, or address...";
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users</h2>
        <span className="text-sm text-gray-600">
          {filtered.length} of {users.length}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={getFilterPlaceholder()}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          aria-label="Filter search field"
        >
          <option value="all">All Fields</option>
          <option value="email">Email Only</option>
          <option value="phone">Phone Only</option>
          <option value="address">Address Only</option>
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
            {users.length === 0
              ? "No users found"
              : "No users match your search"}
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((u) => (
              <div
                key={u.id}
                onClick={() => onSelect(u)}
                className="p-3 bg-white hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="font-medium text-gray-900">{u.id}</div>
                <div className="mt-1 space-y-0.5 text-sm text-gray-600">
                  {u.email && (
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{u.email}</span>
                    </div>
                  )}
                  {u.phone && (
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>{u.phone}</span>
                    </div>
                  )}
                  {u.address && (
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="truncate">{u.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
