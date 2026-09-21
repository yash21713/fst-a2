import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // serverExternalPackages for prisma and resend if needed
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
