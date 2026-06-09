"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { User, Mail, ShieldAlert, LogOut, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useApp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync state with clerkUser when loaded
  useEffect(() => {
    if (clerkUser) {
      setFirstName(clerkUser.firstName || "");
      setLastName(clerkUser.lastName || "");
      setUsername(clerkUser.username || "");
    }
  }, [clerkUser]);

  if (!isLoaded) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn || !clerkUser) {
    return (
      <div className="app-shell flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-xl font-black text-white">Access Denied</h1>
        <p className="mt-2 max-w-md text-center text-sm leading-6 text-zinc-400">
          Please sign in to access settings.
        </p>
        <button
          onClick={() => router.push("/")}
          className="btn-primary mt-5 h-10 px-4 text-xs"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await clerkUser.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim() || undefined,
      });
      setStatus({ type: "success", message: "Profile updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: "error",
        message: err?.errors?.[0]?.longMessage || err?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const emailAddress = clerkUser.primaryEmailAddress?.emailAddress || "No email linked";
  const joinedDate = clerkUser.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }) : "Unknown";

  const linkedProviders = clerkUser.externalAccounts.map(
    (acc) => acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1)
  );

  return (
    <div className="app-shell pb-12">
      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">Settings</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Manage your account settings, edit your profile details, and configure preferences.
          </p>
        </div>

        {status && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-lg border p-4 text-sm ${
              status.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/20 bg-rose-500/10 text-rose-300"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            )}
            <div>
              <p className="font-bold">{status.type === "success" ? "Success" : "Error"}</p>
              <p className="mt-1 text-xs text-zinc-400">{status.message}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Edit Profile Panel */}
          <section className="surface-panel rounded-lg p-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              Edit Profile
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="subtle-input h-10 w-full rounded-md px-3 text-xs"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="subtle-input h-10 w-full rounded-md px-3 text-xs"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500">@</span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="subtle-input h-10 w-full rounded-md pl-7 pr-3 text-xs"
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary h-10 px-4 text-xs font-bold flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Account Details Panel (Read-only / Clerk Info) */}
          <section className="surface-panel rounded-lg p-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              Account Verification & Info
            </h2>
            <div className="space-y-4 text-sm text-zinc-400">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="font-semibold text-zinc-300">Email Address</span>
                <span className="text-white font-mono text-xs">{emailAddress}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="font-semibold text-zinc-300">Member Since</span>
                <span className="text-white text-xs">{joinedDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="font-semibold text-zinc-300">Connected Accounts</span>
                <span className="text-white text-xs">
                  {linkedProviders.length > 0 ? linkedProviders.join(", ") : "Email only"}
                </span>
              </div>
            </div>
          </section>

          {/* Danger Zone Panel (Logout) */}
          <section className="surface-panel border border-rose-500/20 rounded-lg p-6 bg-rose-950/5">
            <h2 className="text-lg font-black text-rose-300 flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              Danger Zone
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Once you log out, you will need to authenticate again to continue solving and competing.
            </p>
            <div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className="btn-secondary border-rose-500/30 text-rose-300 hover:bg-rose-500/10 h-10 px-4 text-xs font-bold flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out / Logout
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
