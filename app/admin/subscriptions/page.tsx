"use client";

import { useEffect, useState } from "react";

type Subscription = {
  id: string;
  status: "PAID" | "PENDING";
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  createdAt: string;
  gym: {
    name: string;
  };
};

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/subscriptions", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed");

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p className="p-6">Loading subscriptions…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">
        Subscriptions
      </h1>

      {/* TABLE CONTAINER */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border border-gray-300 text-sm">
          {/* TABLE HEAD */}
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Gym
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Status
              </th>
              <th className="w-[250px] border px-4 py-2 text-left">
                  Order ID
                </th>
                <th className="w-[250px] border px-4 py-2 text-left">
                  Payment ID
                </th>

              <th className="border border-gray-300 px-4 py-2 text-left">
                Date
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody>
            {data.map((s, index) => (
              <tr
                key={s.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {/* Gym */}
                <td className="border border-gray-300 px-4 py-2">
                  {s.gym?.name}
                </td>

                {/* Status */}
                <td className="border border-gray-300 px-4 py-2">
                  <span
                    className={`font-semibold ${
                      s.status === "PAID"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>

                {/* Order ID */}
                <td className="border border-gray-300 px-4 py-2 text-xs">
                  {s.razorpayOrderId}
                </td>

                {/* Payment ID */}
                <td className="border border-gray-300 px-4 py-2 text-xs">
                  {s.razorpayPaymentId ?? "-"}
                </td>

                {/* Date */}
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-300 px-4 py-6 text-center text-gray-500"
                >
                  No subscriptions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
