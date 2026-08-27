"use client";

import { useState } from "react";

type OrderSummary = {
  id: number;
  email: string;
  name: string;
  cluster: string;
  items: Record<string, number>;
  confirmed: string[];
  allConfirmed: boolean;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Wrong password");
      return;
    }
    const json = await res.json();
    setData(json.summary);
  };

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
          <h1 className="text-lg font-bold mb-4">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700">
            Login
          </button>
        </form>
      </main>
    );
  }

  const totalOrders = data.length;
  const fullyConfirmed = data.filter((d) => d.allConfirmed).length;

  const resetAll = async () => {
    if (!confirm("Reset ALL confirmations? This cannot be undone.")) return;
    await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setData(data.map((d) => ({ ...d, confirmed: [], allConfirmed: false })));
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-bold">Receipt Confirmations</h1>
            <span className="text-sm text-gray-500">
              {fullyConfirmed}/{totalOrders} fully confirmed
            </span>
          </div>
          <button
            onClick={resetAll}
            className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-md hover:bg-red-600"
          >
            Reset All
          </button>
        </div>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Cluster</th>
                <th className="text-left px-3 py-2">Items</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 font-medium">{row.name}</td>
                  <td className="px-3 py-2 text-gray-500">{row.cluster}</td>
                  <td className="px-3 py-2">
                    {Object.entries(row.items).map(([item, qty]) => {
                      const done = row.confirmed.includes(item);
                      return (
                        <span
                          key={item}
                          className={`inline-block mr-2 mb-1 px-2 py-0.5 rounded text-xs ${
                            done
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item} x{qty} {done ? "✓" : "pending"}
                        </span>
                      );
                    })}
                  </td>
                  <td className="px-3 py-2">
                    {row.allConfirmed ? (
                      <span className="text-green-600 font-medium">Done</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
