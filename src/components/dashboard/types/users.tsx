export enum UserRole {
  ADMIN = "overall",
  SUPERVISOR = "supervisor",
  EMPLOYEE = "employee",
}

export enum SupervisoryLevel {
  NONE = "None",
  LEVEL_1 = "Level 1",
  LEVEL_2 = "Level 2",
  LEVEL_3 = "Level 3",
  OVERALL = "Overall",
}

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  supervisoryLevel: SupervisoryLevel
  role: UserRole
  company?: {
    id: number
    name: string
  } | null
  department?: {
    id: number
    name: string
  } | null
  supervisor?: {
    id: number
    username: string
    email?: string
    role?: UserRole
  } | null
  isDirectSubordinate?: boolean
}

export interface Team {
  id: number
  name: string
  supervisorId: number
}

export interface UsersByLevel {
  [SupervisoryLevel.LEVEL_3]: User[]
  [SupervisoryLevel.LEVEL_2]: User[]
  [SupervisoryLevel.LEVEL_1]: User[]
  [SupervisoryLevel.NONE]: User[]
}

export interface LevelCounts {
  [SupervisoryLevel.OVERALL]: number
  [SupervisoryLevel.LEVEL_3]: number
  [SupervisoryLevel.LEVEL_2]: number
  [SupervisoryLevel.LEVEL_1]: number
  [SupervisoryLevel.NONE]: number
  total: number
}

export interface TeamStats {
  totalMembers: number
  levelCounts: LevelCounts
}

export interface HierarchyData {
  team: Team
  supervisorLevel: SupervisoryLevel
  directSubordinates: User[]
  allSubordinates: User[]
  usersByLevel: UsersByLevel
  usersOutsideTeam: User[]
}

export interface AssignmentResponse {
  unassigned: any
  assigned: any
  team: {
    id: number
    name: string
    supervisor: {
      id: number
      username: string
      firstName: string
      lastName: string
      supervisoryLevel: SupervisoryLevel
    }
  }
  assignedUsers: User[]
  teamStats: TeamStats
}

