"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CircleDollarSign, IndianRupee, X } from "lucide-react";

type WithdrawalRow = {
  id: string;
  userId: string;
  userName: string;
  upiId: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function AdminWithdrawalsPage() {
  const [rows, setRows] = useState<WithdrawalRow[]>([]);

  useEffect(() => {
    const sync = async () => {
      const response = await fetch("/api/admin/withdrawals", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: { withdrawals?: WithdrawalRow[] } };
      setRows(Array.isArray(payload.data?.withdrawals) ? payload.data.withdrawals : []);
    };

    void sync();
  }, []);

  const sync = async () => {
    const response = await fetch("/api/admin/withdrawals", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as { data?: { withdrawals?: WithdrawalRow[] } };
    setRows(Array.isArray(payload.data?.withdrawals) ? payload.data.withdrawals : []);
  };

  const updateStatus = async (id: string, status: "approved" | "rejected" | "paid") => {
    await fetch(`/api/admin/withdrawals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await sync();
  };

  return (
    <div className="app-shell min-h-screen bg-background pb-10">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/admin" className="btn-secondary h-10 gap-2 px-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-secondary-text">
            <CircleDollarSign className="h-3.5 w-3.5 text-primary" />
            Withdrawal review queue
          </div>
        </div>

        <section className="surface-panel rounded-[28px] border border-border p-5">
          <h1 className="text-2xl font-black text-white">Withdrawals</h1>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-card text-xs text-secondary-text">
                <tr>
                  <th className="px-4 py-3">User Name</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">UPI ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Request Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="bg-background">
                    <td className="px-4 py-3 text-white">{row.userName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-secondary-text">{row.userId}</td>
                    <td className="px-4 py-3 text-secondary-text">{row.upiId}</td>
                    <td className="px-4 py-3 font-bold text-white">₹{row.amount}</td>
                    <td className="px-4 py-3 text-secondary-text">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-border bg-card px-2 py-1 text-xs font-bold uppercase text-secondary-text">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => updateStatus(row.id, "approved")} className="btn-secondary h-9 px-3 text-xs">
                          <Check className="h-4 w-4" />
                          Approve
                        </button>
                        <button onClick={() => updateStatus(row.id, "paid")} className="btn-primary h-9 px-3 text-xs">
                          <IndianRupee className="h-4 w-4" />
                          Mark Paid
                        </button>
                        <button onClick={() => updateStatus(row.id, "rejected")} className="btn-secondary h-9 px-3 text-xs text-secondary-text">
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
