"use client";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { useEffect } from "react";
import { DataTable } from "./data-table";
import { BackendClient } from "@/lib/request";

export default function Page() {
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();
  const client = new BackendClient();

  useEffect(() => {
    setLoading(false);
    setNavigation([], "Users");
  }, [setLoading, setNavigation]);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        fetchData={client.getUser}
        columns={[
          { key: "uid", label: "ID" },
          { key: "email", label: "Email" },
          { key: "username", label: "Name" },
          { key: "role", label: "Role" },
        ]}
      />
    </div>
  );
}
