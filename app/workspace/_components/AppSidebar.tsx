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
    GetProjectList();
  }, []);

  const GetProjectList = async () => {
    setLoading(true);
    const result = await axios.get("/api/get-all-projects/");
    setProjectList(result.data);
    setLoading(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-5">
        <Link href={"/"}>
          <div className="flex items-center gap-2">
            <Image src={"/logo.svg"} alt="logo" width={35} height={35} />
            <h2 className="font-bold text-xl">AI Web Creator</h2>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm px-2 text-gray-500">
            Projects
          </SidebarGroupLabel>

          {!loading && projectList.length === 0 && (
            <h2 className="text-sm px-2 text-gray-500">No projects yet</h2>
          )}

          <div>
            {!loading && projectList.length > 0
              ? projectList.map((project: any) => (
                  <ProjectItem
                    key={project.projectId}
                    project={project}
                    GetProjectList={GetProjectList}
                  />
                ))
              : [1, 2, 3, 4, 5].map((_, index) => (
                  <Skeleton key={index} className="w-full h-10 rounded-lg mt-2" />
                ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-center gap-2">
          <UserButton />
          <span className="font-semibold text-sm text-gray-700">
            {user?.fullName}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
