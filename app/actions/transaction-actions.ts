"use server";

import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { dispatchTransactionAlertEmail } from "@/lib/email/resend";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateTransactionInput {
  amount: number;
  currency?: string;
  recipientEmail: string;
  recipientName?: string;
  type?: TransactionType;
  description?: string;
}

/**
 * Session-checked Server Action to create a financial transaction,
 * write audit logs, and trigger transactional lifecycle dispatch via Resend & React Email.
 */
export async function createTransactionAction(input: CreateTransactionInput) {
  // 1. Session Enforcement
  const session = await getCurrentSession();
  if (!session) {
    return {
      success: false,
      error: "Authentication Required: Active session token was not found.",
    };
  }

  // 2. Role-Based Access Control Gate
  if (session.role === "GUEST") {
    return {
      success: false,
      error: "Forbidden: Guest personas have read-only access and cannot initiate transactions.",
    };
  }

  // 3. Input Validation
  const amount = Number(input.amount);
  if (isNaN(amount) || amount <= 0) {
    return {
      success: false,
      error: "Validation Error: Amount must be a positive decimal number.",
    };
  }

  if (!input.recipientEmail || !input.recipientEmail.includes("@")) {
    return {
      success: false,
      error: "Validation Error: A valid recipient email address is required.",
    };
  }

  const currency = input.currency || "USD";
  const type = input.type || TransactionType.TRANSFER;
  const recipientName = input.recipientName || input.recipientEmail.split("@")[0];
  const reference = `TXN-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  try {
    // 4. Atomic Prisma Database Mutation (Transaction + Audit Log)
    const result = await prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.create({
        data: {
          reference,
          amount,
          currency,
          type,
          status: TransactionStatus.COMPLETED,
          userId: session.userId,
          recipientEmail: input.recipientEmail,
          recipientName,
          description: input.description || `${type} to ${recipientName}`,
          metadata: {
            initiatedBy: session.email,
            initiatorRole: session.role,
            timestamp: new Date().toISOString(),
          },
        },
      });

      await tx.auditLog.create({
        data: {
          action: "TRANSACTION_CREATED",
          entity: "Transaction",
          entityId: txn.id,
          userId: session.userId,
          details: {
            reference: txn.reference,
            amount,
            currency,
            recipient: input.recipientEmail,
            executorRole: session.role,
          },
        },
      });

      return txn;
    });

    // 5. Post-Mutation Trigger: Transactional Lifecycle Dispatch via Resend & React Email
    const dispatchResult = await dispatchTransactionAlertEmail({
      toEmail: input.recipientEmail,
      recipientName,
      senderName: session.name,
      amount,
      currency,
      reference: result.reference,
      status: result.status,
      type: result.type,
      userId: session.userId,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      success: true,
      transaction: {
        id: result.id,
        reference: result.reference,
        amount: Number(result.amount),
        currency: result.currency,
        status: result.status,
        recipientEmail: result.recipientEmail,
        createdAt: result.createdAt,
      },
      emailDispatch: dispatchResult,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to execute transaction mutation";
    console.error("❌ Transaction creation error:", message);
    return {
      success: false,
      error: message,
    };
  }
}
