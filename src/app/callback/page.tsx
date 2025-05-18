"use client";
import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { OpenIdClient } from "@/lib/request";
export default function page() {

    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const openIdClient = new OpenIdClient();
    useEffect(() => {
        getUserInfo()
    }, [])
    
    const getUserInfo = async() => {
        const token = await openIdClient.getToken(code?? "");
        const userData = await openIdClient.getUserInfo(token.id_token);
    }
  return (
    <div>{code}</div>
  )
}
