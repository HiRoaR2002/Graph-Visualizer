import React, { useState } from "react";
import UserList from "./components/UserList";
import TransactionList from "./components/TransactionList";
import GraphView from "./components/GraphView";

export default function App() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-96 border-r p-4 bg-slate-50 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-4">Graph Explorer</h1>

        {/* USERS */}
        <div>
          <UserList
            onSelect={(u) => {
              setSelectedTx(null);
              setSelectedUser(u.id);
            }}
          />
        </div>

        <div className="my-6 border-t"></div>

        {/* TRANSACTIONS */}
        <div>
          <TransactionList
            onSelect={(t) => {
              setSelectedUser(null);
              setSelectedTx(t.id);
            }}
          />
        </div>

        <div className="text-xs mt-6 text-slate-500">
          Spec:{" "}
          <a href="/mnt/data/Intern coding task.pdf" className="underline">
            Intern coding task.pdf
          </a>
        </div>
      </aside>

      {/* GRAPH VIEW */}
      <main className="flex-1 bg-white">
        <GraphView userId={selectedUser} txId={selectedTx} />
      </main>
    </div>
  );
}
