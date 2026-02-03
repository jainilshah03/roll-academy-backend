"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type Gym = {
  id: string;
  name: string;
};

export default function AdminGymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGyms = async () => {
    const res = await fetch("/api/gyms");
    const data = await res.json();
    setGyms(data);
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const createGym = async () => {
    if (!name.trim()) return alert("Enter gym name");

    setLoading(true);
    const res = await fetch("/api/gyms/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to create gym");
      return;
    }

    setName("");
    fetchGyms();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Gyms</h1>

      {/* Create Gym */}
      <div className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Gym name"
          className="border p-2 rounded w-64"
        />
        <button
          onClick={createGym}
          disabled={loading}
          className="bg-red-700 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* Gym List */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Gym Name</th>
            <th className="p-2 border">ID</th>
          </tr>
        </thead>
        <tbody>
          {gyms.map((gym) => (
            <tr key={gym.id}>
              <td className="p-2 border">{gym.name}</td>
              <td className="p-2 border text-xs">{gym.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
