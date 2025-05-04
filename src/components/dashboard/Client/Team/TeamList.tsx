"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "../../../../Redux/hooks";
import { setSelectedTask } from "../../../../Redux/Slices/TaskReviewSlice";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  User,
  Eye,
  Edit,
} from "lucide-react";
import { Badge } from "../../../ui/Badge";
import { Input } from "../../../ui/input";
import TeamTaskCard from "./TeamTaskCard";

interface TeamListProps {
  teamTasks: any[];
  loading: boolean;
  onOpenReviewModal: () => void;
}

const TeamList: React.FC<TeamListProps> = ({
  teamTasks,
  loading,
  onOpenReviewModal,
}) => {
  const dispatch = useAppDispatch();
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedMembers, setExpandedMembers] = useState<
    Record<string, boolean>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [processedTeams, setProcessedTeams] = useState<any[]>([]);

  // Process team data to remove duplicate tasks
  useEffect(() => {
    if (teamTasks.length > 0) {
      const taskMap = new Map<number, string>(); // Maps taskId to teamName
      const processedTeamsData = teamTasks.map(team => {
        const processedMembers = team.members.map((member: any) => {
          if (!member.dailyTasks || member.dailyTasks.length === 0) {
            return member;
          }

          const processedDailyTasks = member.dailyTasks.map((dailyTask: any) => {
            if (!dailyTask.tasks || dailyTask.tasks.length === 0) {
              return dailyTask;
            }

            const filteredTasks = dailyTask.tasks.filter((task: any) => {
              if (taskMap.has(task.id)) {
                // If task is already assigned to another team, exclude it
                return taskMap.get(task.id) === team.team;
              } else {
                // Mark this task as belonging to this team
                taskMap.set(task.id, team.team);
                return true;
              }
            });

            return {
              ...dailyTask,
              tasks: filteredTasks,
            };
          }).filter((dailyTask: any) => dailyTask.tasks.length > 0);

          return {
            ...member,
            dailyTasks: processedDailyTasks,
          };
        }).filter((member: any) => 
          member.dailyTasks && member.dailyTasks.length > 0
        );

        return {
          ...team,
          members: processedMembers,
        };
      }).filter((team: any) => 
        team.members && team.members.length > 0
      );

      setProcessedTeams(processedTeamsData);

      // Initialize expanded states
      const initialExpandedState: Record<string, boolean> = {};
      const initialMemberState: Record<string, boolean> = {};

      processedTeamsData.forEach((team) => {
        initialExpandedState[team.team] = false;

        if (team.members) {
          team.members.forEach((member: any) => {
            initialMemberState[`${team.team}-${member.id}`] = false;
          });
        }
      });

      setExpandedTeams(initialExpandedState);
      setExpandedMembers(initialMemberState);
    }
  }, [teamTasks]);

  const toggleTeamExpanded = (teamName: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamName]: !prev[teamName],
    }));
  };

  const toggleMemberExpanded = (teamName: string, memberId: number) => {
    const key = `${teamName}-${memberId}`;
    setExpandedMembers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectTask = (task: any) => {
    dispatch(setSelectedTask(task));
    onOpenReviewModal();
  };

  // Filter teams and members based on search term
  const filteredTeamTasks =
    searchTerm.trim() === ""
      ? processedTeams
          .map((team) => {
            const filteredMembers = team.members
              ? team.members.filter((member: any) => {
                  return (
                    member.dailyTasks &&
                    member.dailyTasks.length > 0 &&
                    member.dailyTasks.some(
                      (dailyTask: any) =>
                        dailyTask.tasks && dailyTask.tasks.length > 0
                    )
                  );
                })
              : [];

            return {
              ...team,
              members: filteredMembers,
            };
          })
          .filter((team) => team.members && team.members.length > 0)
      : processedTeams
          .map((team) => {
            const filteredMembers = team.members
              ? team.members
                  .map((member: any) => {
                    if (!member.dailyTasks || member.dailyTasks.length === 0)
                      return null;

                    const filteredDailyTasks = member.dailyTasks
                      .map((dailyTask: any) => {
                        const filteredTasks = dailyTask.tasks.filter(
                          (task: any) =>
                            task.title
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            task.description
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (task.company &&
                              task.company
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())) ||
                            (task.department &&
                              task.department
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())) ||
                            (task.related_project &&
                              task.related_project
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()))
                        );

                        if (filteredTasks.length === 0) return null;

                        return {
                          ...dailyTask,
                          tasks: filteredTasks,
                        };
                      })
                      .filter(Boolean);

                    if (filteredDailyTasks.length === 0) return null;

                    return {
                      ...member,
                      dailyTasks: filteredDailyTasks,
                    };
                  })
                  .filter(Boolean)
              : [];

            if (filteredMembers.length === 0) return null;

            return {
              ...team,
              members: filteredMembers,
            };
          })
          .filter(Boolean);

  // Calculate task statistics for each team
  const getTeamStats = (team: any) => {
    const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };

    if (team.members) {
      team.members.forEach((member: any) => {
        if (member.dailyTasks) {
          member.dailyTasks.forEach((dailyTask: any) => {
            if (dailyTask.tasks) {
              dailyTask.tasks.forEach((task: any) => {
                stats.total++;

                if (task.review_status === "approved") {
                  stats.approved++;
                } else if (task.review_status === "rejected") {
                  stats.rejected++;
                } else {
                  stats.pending++;
                }
              });
            }
          });
        }
      });
    }

    return stats;
  };

  // Calculate task statistics for a member
  const getMemberStats = (member: any) => {
    const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };

    if (member.dailyTasks) {
      member.dailyTasks.forEach((dailyTask: any) => {
        if (dailyTask.tasks) {
          dailyTask.tasks.forEach((task: any) => {
            stats.total++;

            if (task.review_status === "approved") {
              stats.approved++;
            } else if (task.review_status === "rejected") {
              stats.rejected++;
            } else {
              stats.pending++;
            }
          });
        }
      });
    }

    return stats;
  };

  // Calculate task statistics for a daily task submission
  const getDailyTaskStats = (dailyTask: any) => {
    const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };

    if (dailyTask.tasks) {
      dailyTask.tasks.forEach((task: any) => {
        stats.total++;

        if (task.review_status === "approved") {
          stats.approved++;
        } else if (task.review_status === "rejected") {
          stats.rejected++;
        } else {
          stats.pending++;
        }
      });
    }

    return stats;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredTeamTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <Filter className="h-16 w-16 text-gray-300" />
        </div>
        <h3 className="text-xl font-medium text-gray-700">No tasks found</h3>
        <p className="text-gray-500 mt-2">
          There are no tasks that match your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search tasks within teams..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-green text-white"
                  : "bg-white text-gray-500"
              }`}
              title="List View"
            >
              <Users className="h-5 w-5" />
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-green text-white"
                  : "bg-white text-gray-500"
              }`}
              title="Grid View"
            >
              <Shield className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-6">
        {filteredTeamTasks.map((teamData) => {
          const isTeamExpanded = expandedTeams[teamData.team] === true;
          const teamStats = getTeamStats(teamData);

          return (
            <motion.div
              key={teamData.team}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Team Header */}
              <div
                className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleTeamExpanded(teamData.team)}
              >
                <div className="flex items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {teamData.team}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      <span>
                        Supervisor: {teamData.supervisor?.name || "Unknown"}
                      </span>
                      <span className="mx-1.5">•</span>
                      <span>
                        Role: {teamData.supervisor?.role || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Team Members */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="space-y-4">
                        {teamData.members &&
                          teamData.members.map((member: any) => {
                            const isMemberExpanded =
                              expandedMembers[
                                `${teamData.team}-${member.id}`
                              ] === true;
                            const memberStats = getMemberStats(member);
                            return (
                              <div
                                key={member.id}
                                className="border rounded-lg overflow-hidden"
                              >
                                {/* Member Header */}
                                <div
                                  className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                                  onClick={() =>
                                    toggleMemberExpanded(
                                      teamData.team,
                                      member.id
                                    )
                                  }
                                >
                                  <div className="flex items-center">
                                    <div className="mr-3">

                                    </div>
                                    <div>
                                      <h4 className="text-md font-medium text-gray-800 flex items-center">
                                        <User className="h-4 w-4 mr-2 text-gray-500" />
                                        {member.name}
                                      </h4>
                                    </div>
                                  </div>

                                </div>
                                <AnimatePresence>
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      {/* Daily Tasks */}
                                      <div className="p-3 border-t border-gray-200">
                                        <div className="space-y-4">
                                          {member.dailyTasks &&
                                            member.dailyTasks.map(
                                              (dailyTask: any) => {
                                                const dailyTaskStats =
                                                  getDailyTaskStats(dailyTask);
                                                const submissionDate = new Date(
                                                  dailyTask.submission_date
                                                ).toLocaleDateString();
                                                return (
                                                  <div
                                                    key={dailyTask.id}
                                                    className="border rounded-lg overflow-hidden"
                                                  >
                                                    {/* Daily Task Header */}
                                                    <div className="bg-gray-50 p-2 flex justify-between items-center">
                                                      <div>
                                                        <h5 className="text-sm font-medium text-gray-800">
                                                          Submission Date:{" "}
                                                          {submissionDate}
                                                        </h5>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                                                          {dailyTaskStats.total}{" "}
                                                          task
                                                          {dailyTaskStats.total !==
                                                          1
                                                            ? "s"
                                                            : ""}
                                                        </Badge>
                                                      </div>
                                                    </div>
                                                    {/* Tasks */}
                                                    <div className="p-2">
                                                      {viewMode === "grid" ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                          {dailyTask.tasks &&
                                                            dailyTask.tasks.map(
                                                              (task: any) => (
                                                                <TeamTaskCard
                                                                  key={task.id}
                                                                  task={task}
                                                                  onSelect={() =>
                                                                    handleSelectTask(
                                                                      task
                                                                    )
                                                                  }
                                                                />
                                                              )
                                                            )}
                                                        </div>
                                                      ) : (
                                                        <div className="overflow-x-auto">
                                                          <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                              <tr>
                                                                <th
                                                                  scope="col"
                                                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                >
                                                                  Title
                                                                </th>
                                                                <th
                                                                  scope="col"
                                                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                                                                >
                                                                  Status
                                                                </th>
                                                                <th
                                                                  scope="col"
                                                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                                                                >
                                                                  Review Status
                                                                </th>
                                                                <th
                                                                  scope="col"
                                                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                >
                                                                  Action
                                                                </th>
                                                              </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                              {dailyTask.tasks &&
                                                                dailyTask.tasks.map(
                                                                  (
                                                                    task: any
                                                                  ) => (
                                                                    <tr
                                                                      key={
                                                                        task.id
                                                                      }
                                                                      className="hover:bg-gray-50"
                                                                    >
                                                                      <td className="px-4 py-2 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                          {
                                                                            task.title
                                                                          }
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 truncate max-w-xs">
                                                                          {
                                                                            task.description
                                                                          }
                                                                        </div>
                                                                      </td>
                                                                      <td className="px-4 py-2 whitespace-nowrap hidden md:table-cell">
                                                                        <Badge
                                                                          className={`
                                                                               ${
                                                                                 task.status === "completed"
                                                                                   ? "bg-green"
                                                                                   : task.status === "in_progress"
                                                                                   ? "bg-blue"
                                                                                   : task.status === "delayed"
                                                                                   ? "bg-red"
                                                                                   : "bg-gray-400"
                                                                               } 
                                                                               text-white text-xs
                                                                             `}
                                                                        >
                                                                          {task.status?.replace(
                                                                            "_",
                                                                            " "
                                                                          )}
                                                                        </Badge>
                                                                      </td>
                                                                      <td className="px-4 py-2 whitespace-nowrap hidden lg:table-cell">
                                                                        {task.review_status ===
                                                                        "approved" ? (
                                                                          <Badge className="bg-green text-white text-xs">
                                                                            Approved
                                                                          </Badge>
                                                                        ) : task.review_status ===
                                                                          "rejected" ? (
                                                                          <Badge className="bg-red text-white text-xs">
                                                                            Rejected
                                                                          </Badge>
                                                                        ) : (
                                                                          <Badge className="bg-blue text-white text-xs">
                                                                            Pending
                                                                          </Badge>
                                                                        )}
                                                                      </td>
                                                                      <td className="px-4 py-2 whitespace-nowrap">
                                                                        <button
                                                                          onClick={() =>
                                                                            handleSelectTask(
                                                                              task
                                                                            )
                                                                          }
                                                                          disabled={
                                                                            task.reviewed
                                                                          }
                                                                          className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md 
                                                                              ${
                                                                                task.reviewed
                                                                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                                                  : task.review_status !== "pending"
                                                                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                                  : "bg-green text-white hover:bg-green-600"
                                                                              } 
                                                                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green`}
                                                                        >
                                                                          {task.reviewed ? (
                                                                            <>
                                                                              <Eye className="w-3 h-3 mr-1" />
                                                                              Already
                                                                              Reviewed
                                                                            </>
                                                                          ) : task.review_status !==
                                                                            "pending" ? (
                                                                            <>
                                                                              <Eye className="w-3 h-3 mr-1" />
                                                                              View
                                                                            </>
                                                                          ) : (
                                                                            <>
                                                                              <Edit className="w-3 h-3 mr-1" />
                                                                              Review
                                                                            </>
                                                                          )}
                                                                        </button>
                                                                      </td>
                                                                    </tr>
                                                                  )
                                                                )}
                                                            </tbody>
                                                          </table>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                );
                                              }
                                            )}
                                        </div>
                                      </div>
                                    </motion.div>
                                </AnimatePresence>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </motion.div>
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamList;