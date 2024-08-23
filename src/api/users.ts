import { Avatar } from "./avatar";
import { request } from "./request";

type AccountType = "atlassian" | "app" | "customer";

export type User = {
  accountId: string;
  accountType: AccountType;
  avatarUrls?: Avatar;
  displayName: string;
};

export function getMyself() {
  return request<User>("/myself");
}
