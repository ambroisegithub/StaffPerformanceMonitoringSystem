"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  assignUsersToSupervisor,
  fetchSupervisorsByTeam,
  addSelectedUser,
  removeSelectedUser,
  clearSelectedUsers,
  resetSuccess,
  fetchUnassignedUsers,
} from "../../../../Redux/Slices/supervisorSlice"
import type { RootState, AppDispatch } from "../../../../Redux/store"
import { SupervisoryLevel, type User } from "../../types/users"
import { Alert, AlertDescription } from "../../../ui/alert"
import { Button } from "../../../ui/button"
import Checkbox from "../../../ui/checkbox"
import { Label } from "../../../ui/label"
import { AlertCircle, Check, Loader2, UserCheck, UserPlus, Users } from "lucide-react"
import {toast} from "react-toastify"
interface UserAssignmentFormProps {
  onComplete?: () => void
}

const UserAssignmentForm: React.FC<UserAssignmentFormProps> = ({ onComplete }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedUsers, assignmentLoading, error, success, unassignedUsers, selectedTeamId, teamSupervisors } =
    useSelector((state: RootState) => state.supervisor)

  const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | null>(null)
  const [overrideExisting, setOverrideExisting] = useState(false)
  const [eligibleUsers, setEligibleUsers] = useState<User[]>([])
  const [eligibleSupervisors, setEligibleSupervisors] = useState<User[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchUnassignedUsers())
    if (selectedTeamId) {
      dispatch(fetchSupervisorsByTeam(selectedTeamId))
    }
  }, [dispatch, selectedTeamId])

  useEffect(() => {
    setEligibleUsers(unassignedUsers)
  }, [unassignedUsers])

  useEffect(() => {
    if (selectedUsers.length > 0 && teamSupervisors.length > 0) {
      const highestUserLevel = getHighestSupervisoryLevel(selectedUsers)
      const eligible = teamSupervisors.filter((supervisor) => canSuperviseThem(supervisor, highestUserLevel))
      setEligibleSupervisors(eligible)
    } else {
      setEligibleSupervisors(teamSupervisors)
    }
  }, [selectedUsers, teamSupervisors])

  useEffect(() => {
    if (success && isSubmitting) {
      setIsSubmitting(false)
      dispatch(resetSuccess())
      if (onComplete) {
        onComplete()
      }
    }
  }, [success, isSubmitting, dispatch, onComplete])

  useEffect(() => {
    if (error && isSubmitting) {
      setIsSubmitting(false)
    }
  }, [error, isSubmitting])

  const getHighestSupervisoryLevel = (users: User[]): SupervisoryLevel => {
    const levelValues = {
      [SupervisoryLevel.NONE]: 0,
      [SupervisoryLevel.LEVEL_1]: 1,
      [SupervisoryLevel.LEVEL_2]: 2,
      [SupervisoryLevel.LEVEL_3]: 3,
      [SupervisoryLevel.OVERALL]: 4,
    }

    let highestLevel = SupervisoryLevel.NONE
    let highestValue = 0

    users.forEach((user) => {
      const userLevelValue = levelValues[user.supervisoryLevel]
      if (userLevelValue > highestValue) {
        highestValue = userLevelValue
        highestLevel = user.supervisoryLevel
      }
    })

    return highestLevel
  }

  const canSuperviseThem = (supervisor: User, userLevel: SupervisoryLevel): boolean => {
    const levelValues = {
      [SupervisoryLevel.NONE]: 0,
      [SupervisoryLevel.LEVEL_1]: 1,
      [SupervisoryLevel.LEVEL_2]: 2,
      [SupervisoryLevel.LEVEL_3]: 3,
      [SupervisoryLevel.OVERALL]: 4,
    }

    const supervisorValue = levelValues[supervisor.supervisoryLevel]
    const userValue = levelValues[userLevel]

    return supervisorValue > userValue || supervisor.supervisoryLevel === SupervisoryLevel.OVERALL
  }

  const handleUserToggle = (user: User) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id)

    if (isSelected) {
      dispatch(removeSelectedUser(user.id))
    } else {
      dispatch(addSelectedUser(user))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSupervisorId) {
      return
    }

    const userIds = selectedUsers.map((user) => user.id)

    setIsSubmitting(true)

    dispatch(
      assignUsersToSupervisor({
        supervisorId: selectedSupervisorId,
        userIds,
        overrideExistingSupervisor: overrideExisting,
      }),
    )
      .unwrap()
      .then((result) => {
        setIsSubmitting(false)
        dispatch(clearSelectedUsers())

        // Display results
        const assignedCount = result.assigned.length
        const unassignedCount = result.unassigned.length
        toast.success(`Assigned ${assignedCount} user(s) successfully. ${unassignedCount} user(s) were not assigned.`)

        if (onComplete) {
          onComplete()
        }
      })
      .catch(() => {
        setIsSubmitting(false)
      })
  }

  const handleReset = () => {
    dispatch(clearSelectedUsers())
    setSelectedSupervisorId(null)
    setOverrideExisting(false)
  }

  const hasUsersWithSupervisors = selectedUsers.some((user) => user.supervisor)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Select Users to Assign
        </h3>

        <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
          {eligibleUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No users available</p>
          ) : (
            <ul className="space-y-2">
              {eligibleUsers.map((user) => (
                <li key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.some((u) => u.id === user.id)}
                    onCheckedChange={() => handleUserToggle(user)}
                  />
                  <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-muted-foreground text-sm">{user.supervisoryLevel}</span>
                      <span className="text-sm">
                        {user.supervisor ? (
                          <span className="text-amber-600 flex items-center">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Has supervisor
                          </span>
                        ) : (
                          <span className="text-green flex items-center">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Unassigned
                          </span>
                        )}
                      </span>
                    </div>
                  </Label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Selected {selectedUsers.length} of {eligibleUsers.length} users
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <UserCheck className="h-5 w-5 mr-2" />
          Assign to Supervisor
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supervisor">Select Supervisor</Label>
            <select
              id="supervisor"
              value={selectedSupervisorId || ""}
              onChange={(e) => setSelectedSupervisorId(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border rounded-md mt-1"
              disabled={selectedUsers.length === 0}
            >
              <option value="">Select a supervisor</option>
              {eligibleSupervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.id}>
                  {supervisor.firstName} {supervisor.lastName} ({supervisor.supervisoryLevel})
                </option>
              ))}
            </select>

            {selectedUsers.length > 0 && eligibleSupervisors.length === 0 && (
              <p className="text-red-500 text-sm mt-1">
                No eligible supervisors for the selected users' levels in this team
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="override"
              checked={overrideExisting}
              onCheckedChange={(checked) => setOverrideExisting(!!checked)}
            />
            <Label htmlFor="override">Override existing supervisor assignments</Label>
          </div>

          {hasUsersWithSupervisors && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-700 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                {overrideExisting
                  ? "You will override existing supervisor assignments for some users."
                  : "Some selected users already have supervisors. Check 'Override existing supervisor assignments' to reassign them."}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={assignmentLoading || isSubmitting || selectedUsers.length === 0 || !selectedSupervisorId}
              className="flex items-center bg-green text-white hover:bg-green/100"
            >
              {assignmentLoading || isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Assign Users
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="hover:text-white bg-gray-500 text-white"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserAssignmentForm

