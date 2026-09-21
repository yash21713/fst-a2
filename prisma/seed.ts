import { PrismaClient, RoleType, TransactionType, TransactionStatus, EmailStatus, UserStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting automated database seeding pipeline with @faker-js/faker...");

  // 1. Clean existing records in referential integrity order
  console.log("🧹 Clearing existing records to ensure clean state...");
  await prisma.emailLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // 2. Seed Normalized Roles
  console.log("👑 Seeding normalized RBAC roles...");
  const adminRole = await prisma.role.create({
    data: {
      name: RoleType.ADMIN,
      description: "Full platform administrator with unrestricted operational, user management, and auditing capabilities.",
    },
  });

  const memberRole = await prisma.role.create({
    data: {
      name: RoleType.MEMBER,
      description: "Standard registered member with access to transaction creation, balance auditing, and account telemetry.",
    },
  });

  const guestRole = await prisma.role.create({
    data: {
      name: RoleType.GUEST,
      description: "Read-only preview persona with limited access to public overview metrics and system documentation.",
    },
  });

  const roleMap: Record<RoleType, string> = {
    [RoleType.ADMIN]: adminRole.id,
    [RoleType.MEMBER]: memberRole.id,
    [RoleType.GUEST]: guestRole.id,
  };

  // 3. Seed Designated Evaluation Personas (for one-click grading/testing)
  console.log("👤 Creating deterministic evaluation accounts...");
  const demoUsers = [
    {
      name: "Dr. Evelyn Vance (Chief Admin)",
      email: "admin@enterprise.internal",
      roleId: adminRole.id,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Alexander Chen (Senior Member)",
      email: "member@enterprise.internal",
      roleId: memberRole.id,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Jordan Taylor (Guest Evaluator)",
      email: "guest@enterprise.internal",
      roleId: guestRole.id,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  ];

  const createdEvaluationUsers = [];
  for (const u of demoUsers) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        roleId: u.roleId,
        avatarUrl: u.avatarUrl,
        status: UserStatus.ACTIVE,
      },
    });
    createdEvaluationUsers.push(user);
  }

  // 4. Seed 20 Localized Users via @faker-js/faker
  console.log("👥 Generating 20 localized synthetic users with @faker-js/faker...");
  const generatedUsers = [];
  for (let i = 0; i < 20; i++) {
    // 15% Admin, 70% Member, 15% Guest
    const rand = Math.random();
    const assignedRoleType: RoleType =
      rand < 0.15 ? RoleType.ADMIN : rand < 0.85 ? RoleType.MEMBER : RoleType.GUEST;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        avatarUrl: faker.image.avatar(),
        roleId: roleMap[assignedRoleType],
        status: faker.helpers.arrayElement([UserStatus.ACTIVE, UserStatus.ACTIVE, UserStatus.ACTIVE, UserStatus.SUSPENDED]),
        createdAt: faker.date.past({ years: 1 }),
      },
    });
    generatedUsers.push(user);
  }

  const allActiveUsers = [...createdEvaluationUsers, ...generatedUsers].filter(
    (u) => u.status === UserStatus.ACTIVE
  );

  // 5. Seed Relational Transactions
  console.log("💳 Generating 45 relational financial transactions...");
  const transactionTypes: TransactionType[] = [
    TransactionType.TRANSFER,
    TransactionType.PAYMENT,
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
  ];
  const transactionStatuses: TransactionStatus[] = [
    TransactionStatus.COMPLETED,
    TransactionStatus.COMPLETED,
    TransactionStatus.COMPLETED,
    TransactionStatus.PENDING,
    TransactionStatus.FAILED,
  ];

  const createdTransactions = [];
  for (let i = 0; i < 45; i++) {
    const sender = faker.helpers.arrayElement(allActiveUsers);
    const amount = faker.finance.amount({ min: 15, max: 12500, dec: 2 });
    const ref = `TXN-${faker.date.recent().getFullYear()}-${faker.string.alphanumeric(8).toUpperCase()}`;
    const recipientName = faker.person.fullName();
    const recipientEmail = faker.internet.email().toLowerCase();
    const type = faker.helpers.arrayElement(transactionTypes);
    const status = faker.helpers.arrayElement(transactionStatuses);
    const createdAt = faker.date.recent({ days: 45 });

    const txn = await prisma.transaction.create({
      data: {
        reference: ref,
        amount,
        currency: faker.helpers.arrayElement(["USD", "EUR", "GBP", "INR"]),
        type,
        status,
        userId: sender.id,
        recipientEmail,
        recipientName,
        description: `${type} transaction to ${recipientName} for ${faker.commerce.productName()}`,
        metadata: {
          clientIp: faker.internet.ipv4(),
          userAgent: faker.internet.userAgent(),
          category: faker.finance.transactionType(),
          riskScore: faker.number.int({ min: 1, max: 85 }),
          approvalCode: faker.string.alphanumeric(6).toUpperCase(),
        },
        createdAt,
        updatedAt: createdAt,
      },
    });
    createdTransactions.push(txn);
  }

  // 6. Seed Realistic Audit Logs
  console.log("📜 Populating system audit logs...");
  const auditActions = [
    "USER_LOGIN",
    "TRANSACTION_CREATED",
    "ROLE_CHANGE",
    "SESSION_AUTHENTICATED",
    "CRITICAL_ALERT",
    "RESEND_DISPATCH",
  ];

  for (let i = 0; i < 35; i++) {
    const user = faker.helpers.arrayElement(allActiveUsers);
    const action = faker.helpers.arrayElement(auditActions);
    const createdAt = faker.date.recent({ days: 30 });

    await prisma.auditLog.create({
      data: {
        action,
        entity: action.includes("TRANSACTION") ? "Transaction" : action.includes("USER") ? "User" : "Security",
        entityId: action.includes("TRANSACTION")
          ? faker.helpers.arrayElement(createdTransactions).id
          : user.id,
        userId: user.id,
        ipAddress: faker.internet.ipv4(),
        userAgent: faker.internet.userAgent(),
        details: {
          event: action,
          source: "EdgeProxyGate",
          severity: action.includes("ALERT") ? "HIGH" : "INFO",
          timestamp: createdAt.toISOString(),
        },
        createdAt,
      },
    });
  }

  // 7. Seed Email Logs (Sent, Delivered, Bounced)
  console.log("📨 Generating transactional email dispatch history (Sent, Delivered, Bounced)...");
  const emailStatuses: EmailStatus[] = [
    EmailStatus.DELIVERED,
    EmailStatus.DELIVERED,
    EmailStatus.SENT,
    EmailStatus.BOUNCED,
    EmailStatus.OPENED,
  ];

  for (let i = 0; i < 25; i++) {
    const user = faker.helpers.arrayElement(allActiveUsers);
    const status = faker.helpers.arrayElement(emailStatuses);
    const createdAt = faker.date.recent({ days: 20 });
    const resendEmailId = `re_mock_${faker.string.alphanumeric(16)}`;

    await prisma.emailLog.create({
      data: {
        resendEmailId,
        toEmail: user.email,
        templateName: "TransactionAlertEmail",
        subject: `Security Notice: Transaction Confirmation for ${user.name}`,
        status,
        userId: user.id,
        payload: {
          template: "TransactionAlertEmail",
          resendId: resendEmailId,
          deliveryAttempts: status === EmailStatus.BOUNCED ? 3 : 1,
          bounceReason: status === EmailStatus.BOUNCED ? "Mailbox full or destination rejected" : null,
        },
        errorMessage: status === EmailStatus.BOUNCED ? "SMTP 550 5.1.1: Recipient address rejected: User unknown" : null,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }

  console.log("✅ Database seeding pipeline completed successfully!");
  console.log({
    roles: 3,
    users: allActiveUsers.length,
    transactions: createdTransactions.length,
    auditLogs: 35,
    emailLogs: 25,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
