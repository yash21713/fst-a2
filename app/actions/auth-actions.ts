"use server";

import prisma from "@/lib/prisma";
import {
  signSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getCurrentSession,
  RoleType,
} from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

/**
 * Switches the active session to one of the seeded evaluation personas.
 * Perfect for evaluators to test Admin, Member, and Guest RBAC gates with 1 click.
 */
export async function switchRoleAction(targetRole: RoleType) {
  const targetEmail =
    targetRole === "ADMIN"
      ? "admin@enterprise.internal"
      : targetRole === "MEMBER"
      ? "member@enterprise.internal"
      : "guest@enterprise.internal";

  // Find user in database
  let user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: { role: true },
  });

  if (!user) {
    // Fallback to any user matching target role
    user = await prisma.user.findFirst({
      where: { role: { name: targetRole } },
      include: { role: true },
    });
  }

  if (!user) {
    throw new Error(`No user found with role ${targetRole}. Please run npm run db:pipeline`);
  }

  const token = await signSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: targetRole,
    avatarUrl: user.avatarUrl || undefined,
  });

  await setSessionCookie(token);

  // Log session switch in audit log
  await prisma.auditLog.create({
    data: {
      action: "ROLE_SWITCH_EVALUATION",
      entity: "Session",
      userId: user.id,
      details: {
        switchedTo: targetRole,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return { success: true, role: targetRole, user: { name: user.name, email: user.email } };
}

/**
 * Terminates the active session
 */
export async function logoutAction() {
  const session = await getCurrentSession();
  if (session) {
    await prisma.auditLog.create({
      data: {
        action: "USER_LOGOUT",
        entity: "Session",
        userId: session.userId,
        details: { email: session.email, role: session.role },
      },
    });
  }
  await clearSessionCookie();
  revalidatePath("/");
  return { success: true };
}
