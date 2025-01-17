import { useEffect, useState } from "react";
import { getItem } from "@/lib/storage";
import { isUserType, UserType } from "@/types/user";
import { BackendClient } from "@/lib/request";

export const useUserData = (): [UserType, () => void] => {
  const client = new BackendClient();
  const [userData, setUserData] = useState<UserType>({
    email: "",
    username: "",
    role: "",
    phone: "",
    image_url: "",
    uid: 0,
  });

  const fetchData = async () => {
    const userDataLocal = await getItem("user_data");
    if (!userDataLocal) {
      const userData = await client.getUserInfo();
      if (isUserType(userData)) {
        setUserData(userData);
      }
    } else {
      setUserData(JSON.parse(userDataLocal));
    }
  };

  useEffect(() => {
    if (userData.uid == 0){
      fetchData();
    }
  }, [userData]);

  return [userData, fetchData];
};
