/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { OpenIdClient } from "@/lib/open_id";
export default function Page() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const openIdClient = new OpenIdClient();
  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    const token = await openIdClient.getToken(code ?? "");
    const userData = await openIdClient.getUserInfo(token.id_token);
    console.log(userData);
  };
  
  return <div>This feature is implementing..</div>;
}
