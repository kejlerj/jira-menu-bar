import { MenuBarExtra, open } from "@raycast/api";
import { Issue, StatusCategoryKey } from "./api/issues";
import { getJiraCredentials } from "./api/jiraCredentials";
import { PROJECT_NAME } from "./constants/config";
import useIssues from "./hooks/useIssues";
import { withJiraCredentials } from "./hooks/withJiraCredentials";

const jql = `project = '${PROJECT_NAME}' AND assignee = currentUser() ORDER BY updated DESC`;
const icon = { source: "https://www.atlassian.com/favicon.ico", tintColor: "#FFFFFF" };

const getDateDetails = (date: string) => {
  const dateObj = new Date(date);
  // get the number of days since the date
  const diff = Math.round((new Date().getTime() - dateObj.getTime()) / (1000 * 3600 * 24));

  return `Opened ${diff} days ago`;
};

const getIssueUrl = (issueKey: string) => {
  const { siteUrl } = getJiraCredentials();
  return `${siteUrl.startsWith("https://") ? siteUrl : `https://${siteUrl}`}/browse/${issueKey}`;
};

const getStatuses = (issues: Issue[]) => {
  const statuses: string[] = [];

  issues.forEach((issue) => {
    const status = issue.fields.status.name;
    const statusCategory = issue.fields.status.statusCategory?.key;

    if (statuses.includes(status)) return;
    if (statusCategory === StatusCategoryKey.new) {
      statuses.unshift(status);
    } else if (statusCategory === StatusCategoryKey.indeterminate) {
      statuses.push(status);
    }
  });
  return statuses;
};

export function Command() {
  const { issues, isLoading } = useIssues(jql, { keepPreviousData: true });
  const statuses = getStatuses(issues || []);

  return (
    <MenuBarExtra icon={icon} tooltip="Your Jira Issues" isLoading={isLoading}>
      {statuses.map((status) => {
        const filteredIssues = issues?.filter((issue) => issue.fields.status.name === status) || [];
        return (
          <MenuBarExtra.Section key={status}>
            <MenuBarExtra.Item key={status} title={status} subtitle={`(${filteredIssues.length.toString()} issues)`} />
            {filteredIssues.map((issue) => (
              <MenuBarExtra.Item
                key={issue.key}
                icon={{ source: issue.fields.issuetype.iconUrl }}
                title={`${issue.key}: ${issue.fields.summary}`}
                subtitle={getDateDetails(issue.fields.updated)}
                onAction={() => open(getIssueUrl(issue.key))}
              />
            ))}
          </MenuBarExtra.Section>
        );
      })}
    </MenuBarExtra>
  );
}

export default withJiraCredentials(Command);
