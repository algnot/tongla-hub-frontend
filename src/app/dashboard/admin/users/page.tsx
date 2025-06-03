"use client";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { useHelperContext } from "@/components/provider/helper-provider";

export default function Page() {
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();
  const { backendClient } = useHelperContext()();

  useEffect(() => {
    setLoading(false);
    setNavigation([], "All Users");
  }, [setLoading, setNavigation]);

  return (
    <div className="container mx-auto py-10 px-5">
      <DataTable
        fetchData={(limit, offset, text) => backendClient.getUser(limit, offset, text)}
        columns={[
          { key: "uid", label: "ID" },
          { key: "email", label: "Email" },
          { key: "username", label: "Name" },
          { key: "role", label: "Role" },
        ]}
        href="/dashboard/admin/users/{}"
        navigateKey="uid"
        isSearchable
      />
    </div>
  );
}
