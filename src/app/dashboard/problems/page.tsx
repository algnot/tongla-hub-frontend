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
    setNavigation([], "All Problems");
  }, [setLoading, setNavigation]);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        fetchData={client.getQuestion}
        columns={[
          { key: "title", label: "Title" },
          { key: "rate", label: "Rate" },
          { key: "submitted", label: "Submitted" },
          { key: "created_at", label: "Created at" },
        ]}
        href="/dashboard/problems/"
        navigateKey="id"
      />
    </div>
  );
}
