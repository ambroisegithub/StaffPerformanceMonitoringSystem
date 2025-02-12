export enum SupervisoryLevel {
  NONE = "None",
  LEVEL_1 = "Level 1",
  LEVEL_2 = "Level 2",
  LEVEL_3 = "Level 3",
  OVERALL = "Overall",
  SYSTEM_LEADER = "System Leader",
}

export enum UserRole {
  ADMIN = "overall",
  SUPERVISOR = "supervisor",
  EMPLOYEE = "employee",
  SYSTEM_LEADER = "system_leader",
}

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  supervisoryLevel: SupervisoryLevel
  supervisor: Supervisor | null
}

export interface Supervisor extends User {
  subordinatesCount: number
}

