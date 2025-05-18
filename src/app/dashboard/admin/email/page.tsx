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
    setNavigation([], "Email");
  }, [setLoading, setNavigation]);

  return (
    <div className="container mx-auto py-10 px-5">
      <DataTable
        fetchData={(limit, offset, text) => backendClient.getEmailSender(limit, offset, text)}
        columns={[
          { key: "id", label: "ID" },
          { key: "to_email", label: "Email" },
          { key: "status", label: "Status" },
          { key: "reason", label: "Reason" },
          { key: "template_id", label: "Template ID" },
          { key: "send_at", label: "Send at" },
        ]}
        isSearchable
      />
    </div>
  );
}
