import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { RoleType } from "@prisma/client";

/**
 * Session-checked Protected Route Handler (Admin Only)
 */
export async function GET(req: NextRequest) {
  // 1. Session check: Verify proxy header or session cookie
  const roleFromHeader = req.headers.get("x-user-role");
  const session = await getCurrentSession();

  const role = roleFromHeader || session?.role;

  if (!role) {
    return NextResponse.json(
      { error: "Unauthorized: Missing active session" },
      { status: 401 }
    );
  }

  if (role !== "ADMIN") {
    return NextResponse.json(
      {
        error: `Forbidden: Admin clearance required. Current persona is '${role}'`,
      },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        _count: {
          select: {
            transactions: true,
            emailLogs: true,
            auditLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const roles = await prisma.role.findMany();

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
      roles,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Database Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH: Admin update user role
 */
export async function PATCH(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin privileges required" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { userId, targetRole } = body as { userId: string; targetRole: RoleType };

    if (!userId || !targetRole) {
      return NextResponse.json(
        { error: "Missing required fields: userId, targetRole" },
        { status: 400 }
      );
    }

    const roleRecord = await prisma.role.findUnique({
      where: { name: targetRole },
    });

    if (!roleRecord) {
      return NextResponse.json(
        { error: `Role '${targetRole}' does not exist` },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: roleRecord.id },
      include: { role: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "ADMIN_ROLE_CHANGE",
        entity: "User",
        entityId: userId,
        userId: session.userId,
        details: {
          targetUser: updatedUser.email,
          newRole: targetRole,
          changedBy: session.email,
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update role";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
