"use client"
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { UserType } from "@/types/user";
import { useEffect } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function Page() {
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();

  useEffect(() => {
    setLoading(false);
    setNavigation([], "Users");
  }, [setLoading, setNavigation])

  const data: UserType[] = [{
    email: "thanawat@gmail.com",
    username: "thanawat@gmail.com",
    role: "USER",
    image_url: "",
    uid: 12
  }]

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
