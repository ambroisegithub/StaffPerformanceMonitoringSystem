"use client";

import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  deleteTeam,
  setSelectedTeam as setSelectedTeamAction,
} from "../../../../Redux/Slices/teamManagementSlice";
import type { AppDispatch } from "../../../../Redux/store";
import type { Team } from "../../../../Redux/Slices/teamManagementSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/Badge";
import { Trash2, Eye, Loader2, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { Dialog, DialogContent } from "../../../ui/dialog";
import TeamDetailsModal from "./TeamDetail";
import AssignMembersModal from "./AssignMembersModal";

// Update the component to include state for the AssignMembersModal
interface TeamTableProps {
  teams: Team[];
  currentPage: number;
  itemsPerPage: number;
  onViewDetails: (team: Team) => void;
  onManageMembers: (team: Team) => void;
}

const TeamTable: React.FC<TeamTableProps> = ({
  teams,
  currentPage,
  itemsPerPage,
  onViewDetails,
  onManageMembers,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isAssignMembersOpen, setIsAssignMembersOpen] = useState(false);

  const handleDelete = (team: Team) => {
    setTeamToDelete(team);
  };

  const confirmDelete = () => {
    if (teamToDelete) {
      setDeletingTeamId(teamToDelete.id.toString());
      dispatch(deleteTeam(teamToDelete.id)).finally(() => {
        setDeletingTeamId(null);
        setTeamToDelete(null);
      });
    }
  };

  const handleViewDetails = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailsModalOpen(true);
    dispatch(setSelectedTeamAction(team));
    onViewDetails(team);
  };

  // Add a function to handle opening the AssignMembersModal
  const handleAssignMembers = (team: Team) => {
    setSelectedTeam(team);
    dispatch(setSelectedTeamAction(team));
    setIsAssignMembersOpen(true);
    onManageMembers(team);
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team, index) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{team.name}</div>
                    {team.description && (
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {team.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{team.supervisor?.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{team.members.length} members</Badge>
                </TableCell>
                <TableCell>
                  {team.isActive ? (
                    <Badge className="bg-green text-white">Active</Badge>
                  ) : (
                    <Badge className="bg-red text-white">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignMembers(team)}
                      className="h-8 w-8 p-0 hover:bg-white"
                      title="Assign Members"
                    >
                      <UserPlus className="h-4 w-4 text-green" />
                      <span className="sr-only">Assign Members</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(team)}
                      className="h-8 w-8 p-0 hover:bg-white"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(team)}
                      className="h-8 w-8 p-0 text-red hover:bg-white"
                      disabled={deletingTeamId === team.id.toString()}
                      title="Delete Team"
                    >
                      {deletingTeamId === team.id.toString() ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* TeamDetailsModal */}
      <TeamDetailsModal
        team={selectedTeam}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      {/* AssignMembersModal */}
      {isAssignMembersOpen && selectedTeam && (
        <Dialog
          open={isAssignMembersOpen}
          onOpenChange={setIsAssignMembersOpen}
        >
          <DialogContent className="max-w-md">
            <AssignMembersModal
              team={selectedTeam}
              onClose={() => setIsAssignMembersOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={!!teamToDelete}
        onOpenChange={() => setTeamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the team "{teamToDelete?.name}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red hover:bg-red text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeamTable;
