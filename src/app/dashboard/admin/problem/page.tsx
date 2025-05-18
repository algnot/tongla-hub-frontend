"use client";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { useEffect } from "react";
import { DataTable } from "@/components/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useHelperContext } from "@/components/provider/helper-provider";

export default function Page() {
  const { backendClient, userData } = useHelperContext()();
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();

  useEffect(() => {
    setLoading(false);
    setNavigation([], "Problem");
  }, [setLoading, setNavigation]);

  return (
    <div className="container mx-auto py-10 px-5">
      {userData?.role == "ADMIN" && (
        <div className="flex justify-end">
          <Link href="/dashboard/code/add-problem">
            <Button>Create Problem</Button>
          </Link>
        </div>
      )}
      <DataTable
        fetchData={(limit, offset, text) => backendClient.getQuestionAdmin(limit, offset, text)}
        columns={[
          { key: "title", label: "title" },
          { key: "rate", label: "rate" },
          { key: "submitted", label: "submitted" },
          { key: "is_public", label: "Is Public?" },
        ]}
        href="/dashboard/problems/"
        navigateKey="id"
        isSearchable
      />
    </div>
  );
}
