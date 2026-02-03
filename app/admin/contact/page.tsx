"use client";

import { useEffect, useState } from "react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: "NEW" | "READ" | "CLOSED";
  createdAt: string;
};

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  async function fetchMessages() {
    const res = await fetch("/api/contact", {
      credentials: "include",
    });
    const data = await res.json();
    setMessages(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: ContactMessage["status"]) {
    await fetch("/api/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status }),
    });

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return <div className="p-10 text-gray-500">Loading enquiries…</div>;
  }

  return (
    <div className="p-10 bg-[#f7f8fc] min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8">
        Contact Enquiries
      </h1>

      {messages.length === 0 ? (
        <p className="text-gray-500">No enquiries yet.</p>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {messages.map((msg) => {
            const isOpen = openId === msg.id;

            return (
              <div
                key={msg.id}
                className="bg-white border rounded-xl shadow-sm"
              >
                {/* HEADER (CLICKABLE) */}
                <button
                  onClick={() =>
                    setOpenId(isOpen ? null : msg.id)
                  }
                  className="w-full text-left p-5 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {msg.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {msg.email}
                      {msg.subject && ` • ${msg.subject}`}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      msg.status === "NEW"
                        ? "bg-blue-100 text-blue-700"
                        : msg.status === "READ"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {msg.status}
                  </span>
                </button>

                {/* EXPANDED CONTENT */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-[500px] border-t" : "max-h-0"
                  }`}
                >
                  {isOpen && (
                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Message
                        </p>
                        <p className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        {msg.status !== "READ" && (
                          <button
                            onClick={() =>
                              updateStatus(msg.id, "READ")
                            }
                            className="px-4 py-2 text-sm rounded-lg bg-yellow-100 text-yellow-800"
                          >
                            Mark as Read
                          </button>
                        )}
                        {msg.status !== "CLOSED" && (
                          <button
                            onClick={() =>
                              updateStatus(msg.id, "CLOSED")
                            }
                            className="px-4 py-2 text-sm rounded-lg bg-green-100 text-green-800"
                          >
                            Close
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-gray-400">
                        Received on{" "}
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
