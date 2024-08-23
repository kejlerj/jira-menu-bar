import { Project } from "./projects";
import { getAuthenticatedUri, request } from "./request";
import { User } from "./users";

export type IssueType = {
  id: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
};

export type Priority = { id: string; name: string; iconUrl: string; statusColor: string };

export enum StatusCategoryKey {
  indeterminate = "indeterminate",
  new = "new",
  done = "done",
  unknown = "unknown",
}

type IssueStatus = {
  id: string;
  name: string;
  statusCategory?: {
    id: string;
    key: StatusCategoryKey;
    name: string;
    colorName: string;
  };
};

type IssueWatches = {
  isWatching: boolean;
};

export type Issue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: IssueType;
    priority: Priority | null;
    assignee: User | null;
    project: Project | null;
    updated: string;
    status: IssueStatus;
    watches: IssueWatches;
  };
};

type GetIssuesResponse = {
  issues: Issue[];
};

export async function getIssues({ jql } = { jql: "" }) {
  const params = {
    fields: "summary,updated,issuetype,status,priority,assignee,project,watches",
    startAt: "0",
    maxResults: "200",
    validateQuery: "warn",
    jql,
  };

  const result = await request<GetIssuesResponse>("/search", { params });

  if (!result?.issues) {
    return result?.issues;
  }

  const resolvedIssues = await Promise.all(
    result.issues.map(async (issue) => {
      issue.fields.issuetype.iconUrl = await getAuthenticatedUri(issue.fields.issuetype.iconUrl, "image/jpeg");
      return issue;
    }),
  );

  return resolvedIssues;
}
