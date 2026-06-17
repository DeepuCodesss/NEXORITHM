import "server-only";

import { currentUser } from "@clerk/nextjs/server";

export const isAdminUser = async () => {
  const clerkUser = await currentUser();
  return clerkUser?.publicMetadata?.role === "admin";
};

export const requireAdminUser = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.publicMetadata?.role !== "admin") {
    throw new Error("Admin access required.");
  }
  return clerkUser;
};
