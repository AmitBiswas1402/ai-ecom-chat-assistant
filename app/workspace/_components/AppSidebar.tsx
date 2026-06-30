"use client";

import { useContext, useEffect, useState } from "react";
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarFooter } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useUser, UserButton } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import ProjectItem from "./ProjectItem";

export const AppSidebar = () => {
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userDetails } = useContext(UserDetailContext);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      GetProjectList();
    }
  }, [user]);

  const GetProjectList = async () => {
    setLoading(true);
    try {
      const result = await axios.get("/api/get-all-projects/");
      setProjectList(result.data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border/30 mb-2">
        <Link href={"/"}>
          <div className="flex items-center gap-2.5">
            <Image src={"/logo.svg"} alt="logo" width={32} height={32} />
            <h2 className="font-bold text-lg tracking-tight bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/85 bg-clip-text text-transparent">
              AI Web Creator
            </h2>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm px-2 text-muted-foreground/80 mb-1">
            Projects
          </SidebarGroupLabel>

          {!loading && projectList.length === 0 && (
            <h2 className="text-sm px-2 text-muted-foreground/60">No projects yet</h2>
          )}

          <div className="space-y-1.5 mt-1">
            {!loading && projectList.length > 0
              ? projectList.map((project: any) => (
                  <ProjectItem
                    key={project.projectId}
                    project={project}
                    GetProjectList={GetProjectList}
                  />
                ))
              : [
                  { w: "w-3/4" },
                  { w: "w-full" },
                  { w: "w-5/6" },
                  { w: "w-2/3" },
                  { w: "w-4/5" },
                ].map(({ w }, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg"
                  >
                    {/* Icon placeholder */}
                    <Skeleton className="h-5 w-5 rounded-md shrink-0 bg-sidebar-foreground/10" />
                    {/* Label placeholder – varying width feels natural */}
                    <Skeleton
                      className={`h-3.5 rounded-full bg-sidebar-foreground/10 ${w}`}
                    />
                  </div>
                ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/30">
        <div className="flex items-center gap-2.5 px-1">
          <UserButton />
          <span className="font-medium text-sm text-sidebar-foreground/80 truncate">
            {user?.fullName}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
