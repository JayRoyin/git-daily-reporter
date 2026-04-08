import type { AuthTransport } from "../accounts/types";

export interface Credential {
  id: string;
  accountId: string;
  type: AuthTransport;
  displayName: string;
  usernameHint: string;
  lastVerifiedAt: string | null;
  isActive: boolean;
}
