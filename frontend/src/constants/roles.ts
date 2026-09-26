export const Roles = ["SUPERVISOR", "MAINTAINER", "INSPECTOR", "AUDITOR"] as const;
export type Role = (typeof Roles)[number];
export const RoleText: Record<Role, string> = {
  SUPERVISOR: "物业主管",
  MAINTAINER: "维保人员",
  INSPECTOR: "巡检员",
  AUDITOR: "审计员"
};
