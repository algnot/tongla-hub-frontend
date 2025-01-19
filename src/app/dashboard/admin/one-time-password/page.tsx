"use client";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { BackendClient } from "@/lib/request";

export default function Page() {
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();
  const client = new BackendClient();

  useEffect(() => {
    setLoading(false);
    setNavigation([], "One Time Password");
  }, [setLoading, setNavigation]);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        fetchData={client.getOneTimePassword}
        columns={[
          { key: "id", label: "ID" },
          { key: "ref", label: "Ref" },
          { key: "code", label: "Code" },
          { key: "used", label: "Used" },
          { key: "expires_at", label: "Expires at" },
        ]}
      />
    </div>
  );
}
