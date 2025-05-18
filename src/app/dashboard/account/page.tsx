/* eslint-disable @next/next/no-img-element */
"use client";
import { useHelperContext } from "@/components/provider/helper-provider";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isErrorResponse } from "@/types/payload";
import { User } from "lucide-react";
import Link from "next/link";
import React, { FormEvent, useEffect, useRef } from "react";

export default function Page() {
  const { backendClient, setAlert, userData } = useHelperContext()();
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();

  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setNavigation([], "My Account");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const form = formRef.current;
    const username = form?.username?.value ?? "";

    const response = await backendClient.updateUserById(
      userData?.uid.toString() ?? "",
      {
        username,
      },
    );

    if (isErrorResponse(response)) {
      setLoading(false);
      return;
    }

    window.location.reload();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];
      const response = await backendClient.uploadFile(file.type, base64String);

      if (isErrorResponse(response)) {
        setAlert("Error", response.message, 0, true);
        setLoading(false);
        return;
      }

      const updateResponse = await backendClient.updateUserById(
        userData?.uid.toString() ?? "",
        {
          image_url: response.url,
        },
      );

      if (isErrorResponse(updateResponse)) {
        setLoading(false);
        return;
      }

      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="m-6">
      <form className="p-6 border rounded-lg" ref={formRef} onSubmit={onSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 cursor-pointer">
            <Label htmlFor="profile">Profile Picture</Label>
            <label
              htmlFor="file-upload"
              className="w-40 h-40 flex items-center justify-center bg-gray-200 border cursor-pointer"
            >
              {userData?.image_url ? (
                <img
                  src={userData?.image_url}
                  alt="profile"
                  className="w-40 h-40 object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-500" />
              )}
            </label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">email</Label>
            <Input
              id="email"
              type="text"
              placeholder="email"
              defaultValue={userData?.email}
              disabled
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="start_date">username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="username"
              defaultValue={userData?.username}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-fit"
              disabled={userData?.uid == undefined}
            >
              save
            </Button>
          </div>

          <Link href="/forgot-password" className="underline text-sm">
            reset password
          </Link>
        </div>
      </form>
    </div>
  );
}
