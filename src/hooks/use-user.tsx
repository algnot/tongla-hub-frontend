"use client"
import { useEffect, useState } from "react";
import { isUserType, UserType } from "@/types/request";
import { BackendClient } from "@/lib/request";

export const useUserData = (): [UserType | null, () => void] => {
  const client = new BackendClient();
  const [userData, setUserData] = useState<UserType | null>(null);

  const fetchData = async () => {
    const userData = await client.getUserInfo();    
    if (isUserType(userData)) {
      setUserData(userData);
    }
  };

  useEffect(() => {
    if(!userData) {
      fetchData();
    }
  }, [userData]);

  return [userData, fetchData];
};
