import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, signSessionToken, setSessionCookie, clearSessionCookie, RoleType } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();
  return NextResponse.json({
    authenticated: Boolean(session),
    session,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { role } = (await req.json()) as { role: RoleType };

    if (!["ADMIN", "MEMBER", "GUEST"].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const email =
      role === "ADMIN"
        ? "admin@enterprise.internal"
        : role === "MEMBER"
        ? "member@enterprise.internal"
        : "guest@enterprise.internal";

    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: { name: role } },
        include: { role: true },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: `No seeded user found for role ${role}. Run npm run db:pipeline.` },
        { status: 404 }
      );
    }

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role,
      avatarUrl: user.avatarUrl || undefined,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      role,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to switch role";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true, message: "Logged out" });
}
