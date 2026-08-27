"use client";

import { useState } from "react";

type Order = {
  id: number;
  email: string;
  name: string;
  cluster: string;
  items: Record<string, number>;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError("Email not found. Please check and try again.");
        return;
      }
      const data = await res.json();
      setOrder(data.order);
      setConfirmed(data.confirmed);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmReceipt = async (item: string) => {
    setConfirming(item);
    try {
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, item }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfirmed(data.confirmed);
      }
    } finally {
      setConfirming(null);
    }
  };

  const allDone =
    order && Object.keys(order.items).every((item) => confirmed.includes(item));

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-bold text-center mb-1 text-blue-700">
            PSD ITC President&apos;s Challenge
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Confirm receipt of your purchased items
          </p>

          {!order ? (
            <form onSubmit={lookup}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your_name@psd.gov.sg"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                required
              />
              {error && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Looking up..." : "Look Up My Order"}
              </button>
            </form>
          ) : (
            <div>
              <div className="mb-4 pb-3 border-b">
                <p className="text-sm text-gray-600">
                  Hi <span className="font-medium">{order.name}</span> ({order.cluster})
                </p>
              </div>

              {allDone ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">✓</div>
                  <p className="text-green-700 font-medium">
                    All items confirmed!
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Thank you for your support.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(order.items).map(([item, qty]) => {
                    const isConfirmed = confirmed.includes(item);
                    return (
                      <div
                        key={item}
                        className={`flex items-center justify-between p-3 rounded-md border ${
                          isConfirmed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{item}</p>
                          <p className="text-xs text-gray-500">Qty: {qty}</p>
                        </div>
                        {isConfirmed ? (
                          <span className="text-green-600 text-sm font-medium">
                            ✓ Received
                          </span>
                        ) : (
                          <button
                            onClick={() => confirmReceipt(item)}
                            disabled={confirming === item}
                            className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {confirming === item
                              ? "..."
                              : "Confirm Receipt"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => {
                  setOrder(null);
                  setEmail("");
                  setConfirmed([]);
                }}
                className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
