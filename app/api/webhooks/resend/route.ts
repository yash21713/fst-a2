import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EmailStatus } from "@prisma/client";

interface ResendWebhookPayload {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    status?: string;
    bounce?: {
      message?: string;
      type?: string;
    };
  };
  // Fallbacks for direct simulation tests
  emailId?: string;
  email_id?: string;
  status?: string;
  reason?: string;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const payload: ResendWebhookPayload = rawBody;

    const eventType = payload.type || "email.delivered";
    const resendEmailId =
      payload.data?.email_id ||
      payload.emailId ||
      payload.email_id ||
      (typeof payload.data === "string" ? payload.data : null);

    console.log(`📥 Ingested Resend Webhook Event: [${eventType}] for ID: ${resendEmailId}`);

    // Map Resend event type to Prisma EmailStatus enum
    let targetStatus: EmailStatus = EmailStatus.DELIVERED;
    let bounceReason: string | null = null;

    if (eventType === "email.bounced") {
      targetStatus = EmailStatus.BOUNCED;
      bounceReason =
        payload.data?.bounce?.message ||
        payload.reason ||
        "Recipient mailbox unavailable (550 Mailbox Unreachable)";
    } else if (eventType === "email.complained") {
      targetStatus = EmailStatus.COMPLAINED;
    } else if (eventType === "email.opened") {
      targetStatus = EmailStatus.OPENED;
    } else if (eventType === "email.clicked") {
      targetStatus = EmailStatus.CLICKED;
    } else if (eventType === "email.sent") {
      targetStatus = EmailStatus.SENT;
    } else {
      targetStatus = EmailStatus.DELIVERED;
    }

    let updatedLog = null;

    // 1. Locate the existing EmailLog record in PostgreSQL
    if (resendEmailId) {
      updatedLog = await prisma.emailLog.findFirst({
        where: {
          OR: [
            { resendEmailId: resendEmailId },
            { id: resendEmailId },
          ],
        },
      });
    }

    if (updatedLog) {
      // 2. Update existing EmailLog status in PostgreSQL
      const safePayload = JSON.parse(
        JSON.stringify({
          ...(typeof updatedLog.payload === "object" && updatedLog.payload !== null
            ? (updatedLog.payload as Record<string, unknown>)
            : {}),
          lastWebhookEvent: eventType,
          webhookReceivedAt: new Date().toISOString(),
          rawWebhookData: payload.data || payload,
        })
      );

      updatedLog = await prisma.emailLog.update({
        where: { id: updatedLog.id },
        data: {
          status: targetStatus,
          errorMessage: bounceReason || updatedLog.errorMessage,
          updatedAt: new Date(),
          payload: safePayload,
        },
      });
    } else {
      // Create a new entry if webhook is reporting an unlogged external email
      const toEmail = payload.data?.to?.[0] || "external@recipient.domain";
      const safePayload = JSON.parse(
        JSON.stringify({
          eventType,
          rawWebhookData: payload,
        })
      );

      updatedLog = await prisma.emailLog.create({
        data: {
          resendEmailId: resendEmailId || `re_ext_${Date.now()}`,
          toEmail,
          templateName: "ExternalWebhookDispatch",
          subject: payload.data?.subject || `Webhook Ingested: ${eventType}`,
          status: targetStatus,
          errorMessage: bounceReason,
          payload: safePayload,
        },
      });
    }

    // 3. Insert an AuditLog entry for compliance and observability
    const isCritical =
      targetStatus === EmailStatus.BOUNCED ||
      targetStatus === EmailStatus.COMPLAINED;

    await prisma.auditLog.create({
      data: {
        action: isCritical ? "CRITICAL_EMAIL_BOUNCE" : "EMAIL_DELIVERY_CONFIRMED",
        entity: "EmailLog",
        entityId: updatedLog.id,
        userId: updatedLog.userId,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: req.headers.get("user-agent") || "Resend-Webhook-Dispatcher/1.0",
        details: JSON.parse(
          JSON.stringify({
            resendEmailId,
            eventType,
            status: targetStatus,
            bounceReason,
            recipient: updatedLog.toEmail,
            severity: isCritical ? "ALERT" : "INFO",
          })
        ),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Webhook processed successfully for event '${eventType}'`,
      emailLogId: updatedLog.id,
      resendEmailId: updatedLog.resendEmailId,
      status: updatedLog.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error processing Resend webhook:", errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// Support GET for health check
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    endpoint: "/api/webhooks/resend",
    description: "Resend Webhook Ingestion Gate configured for delivery & bounce logging",
    supportedEvents: [
      "email.sent",
      "email.delivered",
      "email.bounced",
      "email.complained",
      "email.opened",
      "email.clicked",
    ],
  });
}
