import { SessionPayload, RoleType } from "./session";

export interface ProxyGateResult {
  allowed: boolean;
  statusCode?: 401 | 403;
  redirectUrl?: string;
  reason?: string;
}

/**
 * RBAC Permission Matrix for Route Segments
 */
export const ROUTE_PERMISSIONS: Record<
  string,
  { allowedRoles: RoleType[]; isApi: boolean }
> = {
  "/admin": { allowedRoles: ["ADMIN"], isApi: false },
  "/api/admin": { allowedRoles: ["ADMIN"], isApi: true },
  "/dashboard": { allowedRoles: ["ADMIN", "MEMBER"], isApi: false },
  "/api/transactions": { allowedRoles: ["ADMIN", "MEMBER"], isApi: true },
  "/api/member": { allowedRoles: ["ADMIN", "MEMBER"], isApi: true },
};

/**
 * Evaluates whether a given request path is permitted for the active session
 */
export function evaluateProxyGate(
  pathname: string,
  session: SessionPayload | null
): ProxyGateResult {
  // 1. Check exact or prefix matches against protected routes
  const matchedRuleKey = Object.keys(ROUTE_PERMISSIONS).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If route is public / unlisted in the matrix, allow
  if (!matchedRuleKey) {
    return { allowed: true };
  }

  const rule = ROUTE_PERMISSIONS[matchedRuleKey];

  // 2. Unauthenticated check
  if (!session) {
    if (rule.isApi) {
      return {
        allowed: false,
        statusCode: 401,
        reason: "Authentication required: No valid session token provided.",
      };
    }
    return {
      allowed: false,
      redirectUrl: `/login?callbackUrl=${encodeURIComponent(pathname)}`,
      reason: "Redirecting unauthenticated user to login.",
    };
  }

  // 3. Role-Based Access Control (RBAC) authorization check
  if (!rule.allowedRoles.includes(session.role)) {
    if (rule.isApi) {
      return {
        allowed: false,
        statusCode: 403,
        reason: `Forbidden: Role '${session.role}' is not authorized for this endpoint (Requires: ${rule.allowedRoles.join(", ")}).`,
      };
    }
    return {
      allowed: false,
      redirectUrl: `/unauthorized?role=${session.role}&required=${rule.allowedRoles.join(",")}`,
      reason: `Access Denied: Persona '${session.role}' lacks requisite permission.`,
    };
  }

  return { allowed: true };
}
