import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { dispatchTransactionAlertEmail } from "@/lib/email/resend";
import { TransactionType, TransactionStatus } from "@prisma/client";

/**
 * Session-checked Protected Route Handler for Transactions (Member / Admin)
 */
export async function GET(req: NextRequest) {
  // Check session
  const session = await getCurrentSession();
  const headerRole = req.headers.get("x-user-role");
  const headerUserId = req.headers.get("x-user-id");

  const role = headerRole || session?.role;
  const userId = headerUserId || session?.userId;

  if (!role || !userId) {
    return NextResponse.json(
      { error: "Unauthorized: Active session required" },
      { status: 401 }
    );
  }

  try {
    // If ADMIN: can see all transactions; If MEMBER: sees their own
    const transactions = await prisma.transaction.findMany({
      where: role === "ADMIN" ? {} : { userId },
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      count: transactions.length,
      role,
      transactions,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Database Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST: Create a transaction and trigger transactional email dispatch
 */
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  const headerRole = req.headers.get("x-user-role");
  const headerUserId = req.headers.get("x-user-id");
  const headerEmail = req.headers.get("x-user-email");
  const headerName = req.headers.get("x-user-name");

  const role = headerRole || session?.role;
  const userId = headerUserId || session?.userId;
  const email = headerEmail || session?.email;
  const name = headerName || session?.name;

  if (!role || !userId) {
    return NextResponse.json(
      { error: "Unauthorized: Valid session required" },
      { status: 401 }
    );
  }

  // RBAC Gate: Guests cannot transact
  if (role === "GUEST") {
    return NextResponse.json(
      {
        error: "Forbidden: Guest personas have read-only access and cannot create transactions.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { amount, currency, recipientEmail, recipientName, type, description } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount: must be greater than 0" },
        { status: 400 }
      );
    }

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json(
        { error: "Invalid recipient email" },
        { status: 400 }
      );
    }

    const reference = `TXN-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Prisma Transaction & Audit Log
    const txn = await prisma.$transaction(async (tx) => {
      const createdTxn = await tx.transaction.create({
        data: {
          reference,
          amount: parsedAmount,
          currency: currency || "USD",
          type: (type as TransactionType) || TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          userId,
          recipientEmail,
          recipientName: recipientName || recipientEmail.split("@")[0],
          description: description || `Transfer via API Route Handler`,
          metadata: {
            source: "RouteHandler",
            initiatorEmail: email,
            initiatorRole: role,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          action: "API_TRANSACTION_MUTATION",
          entity: "Transaction",
          entityId: createdTxn.id,
          userId,
          details: {
            reference,
            amount: parsedAmount,
            recipient: recipientEmail,
            role,
          },
        },
      });

      return createdTxn;
    });

    // Lifecycle Dispatch via Resend & React Email
    const emailResult = await dispatchTransactionAlertEmail({
      toEmail: recipientEmail,
      recipientName: recipientName || recipientEmail.split("@")[0],
      senderName: name || "Enterprise Member",
      amount: parsedAmount,
      currency: currency || "USD",
      reference,
      status: txn.status,
      type: txn.type,
      userId,
    });

    return NextResponse.json({
      success: true,
      transaction: txn,
      emailDispatch: emailResult,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to execute transaction";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
