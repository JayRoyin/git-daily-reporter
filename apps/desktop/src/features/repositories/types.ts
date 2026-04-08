export interface Repository {
  id: string;
  name: string;
  remoteUrl: string;
  defaultBranch: string;
  accountId: string;
  credentialId: string;
  authorFilterMode: "account_email" | "custom";
  authorFilterValue: string;
}
