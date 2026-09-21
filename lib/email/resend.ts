import { Resend } from "resend";
import { render } from "@react-email/render";
import { TransactionAlertEmail } from "@/emails/TransactionAlertEmail";
import prisma from "@/lib/prisma";
import { EmailStatus } from "@prisma/client";

const resendApiKey = process.env.RESEND_API_KEY;
const isResendConfigured =
  Boolean(resendApiKey) &&
  resendApiKey !== "re_123456789" &&
  !resendApiKey?.startsWith("dummy");

const resend = isResendConfigured ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export interface TransactionEmailParams {
  toEmail: string;
  recipientName: string;
  senderName: string;
  amount: number | string;
  currency: string;
  reference: string;
  status: string;
  type: string;
  userId: string;
}

export interface DispatchResult {
  success: boolean;
  resendId: string;
  simulated: boolean;
  emailLogId: string;
  error?: string;
}

/**
 * Dispatches a transaction lifecycle alert via Resend & React Email,
 * then persists an audit-ready EmailLog in PostgreSQL.
 */
export async function dispatchTransactionAlertEmail(
  params: TransactionEmailParams
): Promise<DispatchResult> {
  const {
    toEmail,
    recipientName,
    senderName,
    amount,
    currency,
    reference,
    status,
    type,
    userId,
  } = params;

  let resendId = `re_sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  let simulated = true;

  try {
    // 1. Render React Email component to pure HTML
    const emailHtml = await render(
      TransactionAlertEmail({
        recipientName,
        senderName,
        amount,
        currency,
        reference,
        status,
        type,
        date: new Date().toUTCString(),
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
      })
    );

    // 2. Transmit via Resend if credentials exist
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: `FST Ledger <${fromEmail}>`,
          to: [toEmail],
          subject: `Security Alert: Transaction ${reference} (${currency} ${amount})`,
          html: emailHtml,
        });

        if (error) {
          console.warn(
            `⚠️ Resend API responded with error, falling back to simulated log: ${error.message}`
          );
        } else if (data?.id) {
          resendId = data.id;
          simulated = false;
        }
      } catch (sendErr) {
        console.warn(
          "⚠️ Resend dispatch encountered network exception, continuing with local simulation:",
          sendErr
        );
      }
    } else {
      console.log(
        `📬 [Simulation Mode] Dispatched TransactionAlertEmail to ${toEmail} for txn ${reference} (Mock Resend ID: ${resendId})`
      );
    }

    // 3. Persist lifecycle record in PostgreSQL EmailLog table
    const emailLog = await prisma.emailLog.create({
      data: {
        resendEmailId: resendId,
        toEmail,
        templateName: "TransactionAlertEmail",
        subject: `Security Alert: Transaction ${reference} (${currency} ${amount})`,
        status: EmailStatus.SENT,
        userId,
        payload: {
          reference,
          amount,
          currency,
          recipientName,
          senderName,
          type,
          status,
          simulated,
          dispatchedAt: new Date().toISOString(),
        },
      },
    });

    return {
      success: true,
      resendId,
      simulated,
      emailLogId: emailLog.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Failed to process transaction email dispatch:", errorMsg);

    // Record failed dispatch attempt
    const errorLog = await prisma.emailLog.create({
      data: {
        resendEmailId: resendId,
        toEmail,
        templateName: "TransactionAlertEmail",
        subject: `[FAILED] Transaction Alert: ${reference}`,
        status: EmailStatus.BOUNCED,
        userId,
        errorMessage: errorMsg,
        payload: { reference, error: errorMsg },
      },
    });

    return {
      success: false,
      resendId,
      simulated: true,
      emailLogId: errorLog.id,
      error: errorMsg,
    };
  }
}
