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
    setNavigation([], "One Time Password");
  }, [setLoading, setNavigation]);

  return (
    <div className="container mx-auto py-10 px-5">
      <DataTable
        fetchData={(limit, offset, text) =>
          backendClient.getOneTimePassword(limit, offset, text)
        }
        columns={[
          { key: "id", label: "ID" },
          { key: "ref", label: "Ref" },
          { key: "code", label: "Code" },
          { key: "used", label: "Used" },
          { key: "expires_at", label: "Expires at" },
        ]}
        isSearchable
      />
    </div>
  );
}
