/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useHelperContext } from "@/components/provider/helper-provider";
import { isErrorResponse } from "@/types/payload";
export default function Page() {
  const searchParams = useSearchParams();
  const { backendClient, setFullLoading } = useHelperContext()();
  const code = searchParams.get("code") ?? "";

  useEffect(() => {
    setFullLoading(true);
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    const response = await backendClient.getOpenidToken({
      code: code,
    });

    if (isErrorResponse(response)) {
      return;
    }

    window.location.href = "/dashboard/problems";
  };

  return <div></div>;
}
