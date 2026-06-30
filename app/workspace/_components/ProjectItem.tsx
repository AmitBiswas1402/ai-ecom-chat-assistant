"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Edit3, MoreVertical, Trash2 } from "lucide-react";
import axios from "axios";
import Link from "next/link";

type ProjectItemProps = {
  project: any;
  GetProjectList: () => void;
};

const ProjectItem = ({ project, GetProjectList }: ProjectItemProps) => {
  const chatMessage = project?.chats?.[0]?.chatMessage;
  let title = "Untitled Project";

  if (Array.isArray(chatMessage) && chatMessage[0]?.content) {
    title = chatMessage[0].content;
  } else if (typeof chatMessage === "string") {
    title = chatMessage;
  }

  const [openDialog, setOpenDialog] = useState(false);
  const [newName, setNewName] = useState(title);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleRename = async () => {
    if (!newName.trim()) return;
    await axios.post("/api/rename-project", {
      projectId: project.projectId,
      newName,
    });
    setOpenDialog(false);
    GetProjectList(); // refresh after rename
  };

  const handleDelete = async () => {
    try {
      await axios.post("/api/delete-project", {
        projectId: project.projectId,
      });
      setOpenDeleteDialog(false);
      GetProjectList();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div
      key={project.projectId}
      className="py-1.5 px-2.5 rounded-lg cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent hover:border-sidebar-border transition-all duration-200 flex items-center justify-between group"
    >
      {/* Project Link */}
      <Link
        href={`/playground/${project.projectId}?frameId=${project.frameId}`}
        className="flex-1 line-clamp-1 text-sm font-medium text-sidebar-foreground/90 group-hover:text-sidebar-foreground transition-colors"
      >
        {title}
      </Link>

      {/* Popover Menu */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-sidebar-accent/80 text-muted-foreground hover:text-foreground rounded-full h-8 w-8 transition-colors shrink-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-40 p-1 bg-popover text-popover-foreground border border-border shadow-md rounded-xl cursor-pointer"
        >
          <button
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
            onClick={() => setOpenDialog(true)}
          >
            <Edit3 className="w-4 h-4" />
            Rename
          </button>

          <button
            className="flex items-center gap-2 w-full p-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer text-left"
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </PopoverContent>
      </Popover>

      {/* Rename Dialog */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Project</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border border-border bg-background text-foreground p-2 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring text-sm"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>Rename</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectItem;
