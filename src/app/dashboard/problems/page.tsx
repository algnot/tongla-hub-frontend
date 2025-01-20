"use client";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { BackendClient } from "@/lib/request";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/use-user";
import Link from "next/link";

export default function Page() {
  const [userData] = useUserData();
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();
  const client = new BackendClient();

  useEffect(() => {
    setLoading(false);
    setNavigation([], "All Problems");
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
