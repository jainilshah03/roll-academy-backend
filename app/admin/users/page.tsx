"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type Gym = {
  id: string;
  name: string;
  _count: {
    users: number;
  };
};

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
};

export default function AdminUsersPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetch("/api/admin/gyms")
      .then((res) => res.json())
      .then(setGyms);
  }, []);

  const loadUsers = async (gymId: string) => {
    const gym = gyms.find((g) => g.id === gymId);
    if (!gym) return;

    setSelectedGym(gym);
    setLoadingUsers(true);

    const res = await fetch(`/api/admin/users/by-gym?gymId=${gymId}`, {
  credentials: "include",
});


    const data = await res.json();

    setUsers(data);
    setLoadingUsers(false);
  };

  return (
    <div className="p-6 max-w-6xl">
      <h2 className="text-xl font-semibold mb-4">
        Users by Gym
      </h2>

      {/* ================= GYM DROPDOWN ================= */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Select Gym
        </label>

        <select
          className="border rounded px-4 py-2 w-80"
          defaultValue=""
          onChange={(e) => loadUsers(e.target.value)}
        >
          <option value="" disabled>
            -- Select a gym --
          </option>

          {gyms.map((gym) => (
            <option key={gym.id} value={gym.id}>
              {gym.name} ({gym._count.users})
            </option>
          ))}
        </select>
      </div>

      {/* ================= USERS TABLE ================= */}
      {loadingUsers ? (
        <p>Loading users...</p>
      ) : selectedGym ? (
        <>
          <h3 className="text-lg font-semibold mb-3">
            Users — {selectedGym.name}
          </h3>

          <table className="w-full border border-gray-400 border-collapse">
  <thead>
    <tr className="bg-gray-100 text-left">
      <th className="p-3 border border-gray-300 w-1/4">
        Name
      </th>
      <th className="p-3 border border-gray-300 w-2/4">
        Email
      </th>
      <th className="p-3 border border-gray-300 w-1/4">
        Role
      </th>
    </tr>
  </thead>

  <tbody>
  {users.map((u) => (
    <tr
      key={u.id}
      className="border-b border-gray-400"
    >
      <td className="p-2">
        {u.name || "-"}
      </td>

      <td className="p-2 break-all">
        {u.email}
      </td>

      <td className="p-2">
        {u.role || "USER"}
      </td>
    </tr>
  ))}

  {users.length === 0 && (
    <tr className="border-b border-gray-400">
      <td
        colSpan={3}
        className="p-3 text-center text-gray-500"
      >
        No users in this gym
      </td>
    </tr>
  )}
</tbody>

</table>

        </>
      ) : (
        <p className="text-gray-500">
          Please select a gym to view users
        </p>
      )}
    </div>
  );
}
