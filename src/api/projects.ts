import { Avatar } from "./avatar";

export type Project = {
  id: string;
  key: string;
  name: string;
  avatarUrls?: Avatar;
  style: "classic" | "next-gen";
};
