import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface TransactionAlertEmailProps {
  recipientName?: string;
  senderName?: string;
  amount?: string | number;
  currency?: string;
  reference?: string;
  status?: string;
  type?: string;
  date?: string;
  dashboardUrl?: string;
}

export const TransactionAlertEmail = ({
  recipientName = "Valued Member",
  senderName = "Enterprise System",
  amount = "500.00",
  currency = "USD",
  reference = "TXN-2026-DEMO99",
  status = "COMPLETED",
  type = "TRANSFER",
  date = new Date().toUTCString(),
  dashboardUrl = "http://localhost:3000/dashboard",
}: TransactionAlertEmailProps) => {
  const isCompleted = status.toUpperCase() === "COMPLETED";
  const formattedAmount =
    typeof amount === "number" ? amount.toFixed(2) : String(amount);

  const previewText = `Security Alert: Transaction ${reference} (${currency} ${formattedAmount}) ${status}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandBadge}>FST ENTERPRISE LEDGER</Text>
            <Heading style={heading}>Transaction Notification</Heading>
            <Text style={subheading}>
              Automated lifecycle dispatch verified by Prisma ORM
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Amount Box */}
          <Section style={amountBox}>
            <Text style={amountLabel}>{type} AMOUNT</Text>
            <Text style={amountValue}>
              {currency} {formattedAmount}
            </Text>
            <Text
              style={{
                ...statusBadge,
                backgroundColor: isCompleted ? "#064e3b" : "#78350f",
                color: isCompleted ? "#34d399" : "#fbbf24",
              }}
            >
              STATUS: {status}
            </Text>
          </Section>

          {/* Details Table */}
          <Section style={detailsSection}>
            <Text style={sectionTitle}>Transaction Telemetry</Text>

            <div style={detailRow}>
              <span style={detailKey}>Reference:</span>
              <span style={detailValMono}>{reference}</span>
            </div>
            <div style={detailRow}>
              <span style={detailKey}>Sender Persona:</span>
              <span style={detailVal}>{senderName}</span>
            </div>
            <div style={detailRow}>
              <span style={detailKey}>Recipient:</span>
              <span style={detailVal}>{recipientName}</span>
            </div>
            <div style={detailRow}>
              <span style={detailKey}>Timestamp:</span>
              <span style={detailVal}>{date}</span>
            </div>
            <div style={detailRow}>
              <span style={detailKey}>Security Signature:</span>
              <span style={detailValMono}>HMAC-SHA256:VERIFIED</span>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Action CTA */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={dashboardUrl}>
              Audit in Dashboard →
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated lifecycle message dispatched via Resend API and
              React Email components in compliance with assignment CO3 & CO4.
            </Text>
            <Text style={footerText}>
              If you did not authorize this activity, please access your security
              settings immediately.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TransactionAlertEmail;

const main: React.CSSProperties = {
  backgroundColor: "#090d16",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  padding: "40px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  margin: "0 auto",
  padding: "32px",
  maxWidth: "560px",
};

const headerSection: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const brandBadge: React.CSSProperties = {
  display: "inline-block",
  fontSize: "11px",
  letterSpacing: "1.5px",
  fontWeight: "700",
  color: "#818cf8",
  backgroundColor: "rgba(99, 102, 241, 0.12)",
  padding: "4px 10px",
  borderRadius: "4px",
  margin: "0 0 12px 0",
};

const heading: React.CSSProperties = {
  color: "#f8fafc",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 6px 0",
};

const subheading: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "24px 0",
};

const amountBox: React.CSSProperties = {
  backgroundColor: "#131d36",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center",
  border: "1px solid rgba(99, 102, 241, 0.2)",
};

const amountLabel: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "11px",
  letterSpacing: "1px",
  fontWeight: "600",
  margin: "0 0 6px 0",
};

const amountValue: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "800",
  letterSpacing: "-0.5px",
  margin: "0 0 12px 0",
};

const statusBadge: React.CSSProperties = {
  display: "inline-block",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  padding: "4px 12px",
  borderRadius: "9999px",
  margin: 0,
};

const detailsSection: React.CSSProperties = {
  margin: "20px 0",
};

const sectionTitle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "12px",
};

const detailRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  fontSize: "13px",
};

const detailKey: React.CSSProperties = {
  color: "#94a3b8",
};

const detailVal: React.CSSProperties = {
  color: "#e2e8f0",
  fontWeight: "500",
};

const detailValMono: React.CSSProperties = {
  color: "#a5b4fc",
  fontFamily: "monospace",
  fontWeight: "600",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  margin: "24px 0 12px 0",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  borderRadius: "8px",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  marginTop: "24px",
};

const footerText: React.CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "4px 0",
};
