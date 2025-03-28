/* eslint-disable @next/next/no-img-element */
"use client";
import { useAlertContext } from "@/components/provider/alert-provider";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackendClient } from "@/lib/request";
import { isErrorResponse } from "@/types/payload";
import { GetUserByIdResponse } from "@/types/request";
import { User } from "lucide-react";
import Link from "next/link";
import React, { FormEvent, useEffect, useRef, useState } from "react";

type PageProps = {
  params: Promise<{ user_id: string[] }>;
};

export default function Page({ params }: PageProps) {
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();
  const setAlert = useAlertContext();
  const client = new BackendClient();

  const [defaultValue, setDefaultValue] = useState<GetUserByIdResponse>();
  const [isCoding, setIsCoding] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const checkSocketConnect = async (username: string, uid: string) => {
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_PATH}/${username}-${uid}`
    );

    socket.onmessage = (event) => {
      const { action } = JSON.parse(event.data);
      if (action == "initCode") {
        setIsCoding(true);
      }
    };

    socket.onclose = () => {
      setIsCoding(false);
    };

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          action: "connected",
          userId: 0,
        })
      );
    };
  };

  const fetchData = async () => {
    const { user_id } = await params;
    const userId = Array.isArray(user_id) ? user_id[0] : user_id;
    const response = await client.getUserById(userId);

    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      setLoading(false);
      return;
    }

    checkSocketConnect(response.username, response.uid.toString());

    setDefaultValue(response);
    setNavigation(
      [
        {
          name: "All Users",
          path: "/dashboard/admin/users",
        },
      ],
      response.email
    );
  };

  useEffect(() => {
    setLoading(false);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const { user_id } = await params;
    const userId = Array.isArray(user_id) ? user_id[0] : user_id;
    event.preventDefault();
    setLoading(true);

    const form = formRef.current;
    const username = form?.username?.value ?? "";
    const email = form?.email?.value ?? "";
    const role = form?.roleType?.value ?? "";
    const image_url = form?.image_url?.value ?? "";

    const response = await client.updateUserById(userId, {
      username,
      email,
      role,
      image_url,
    });

    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      setLoading(false);
      return;
    }

    setAlert(
      "Updated",
      "The data is updated :)",
      () => {
        window.location.reload();
      },
      false
    );
  };

  return (
    <div className="m-6">
      <form className="p-6 border rounded-lg" ref={formRef} onSubmit={onSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex justify-end gap-2">
            <Button type="submit" className="w-fit">
              save
            </Button>
            {isCoding && (
              <Link
                href={`/code-with-friend/${defaultValue?.username}-${defaultValue?.uid}`}
                target="_blank"
              >
                <Button type="button" className="w-fit">
                  Code with {defaultValue?.username}
                </Button>
              </Link>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile">Profile Picture</Label>
            <label
              htmlFor="file-upload"
              className="w-40 h-40 flex items-center justify-center bg-gray-200 border"
            >
              {defaultValue?.image_url ? (
                <img
                  src={defaultValue?.image_url}
                  alt="profile"
                  className="w-40 h-40 object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-500" />
              )}
            </label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="uid">uid</Label>
            <Input
              id="uid"
              placeholder="uid"
              defaultValue={defaultValue?.uid}
              disabled
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="username"
              defaultValue={defaultValue?.username}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">email</Label>
            <Input
              id="email"
              name="email"
              type="text"
              placeholder="email"
              defaultValue={defaultValue?.email}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">role</Label>
            <Input
              id="role"
              name="roleType"
              type="text"
              placeholder="role"
              defaultValue={defaultValue?.role}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image_url">image_url</Label>
            <Input
              id="image_url"
              name="image_url"
              type="text"
              placeholder="image_url"
              defaultValue={defaultValue?.image_url}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="score">Score</Label>
            <Input
              id="score"
              placeholder="Score"
              type="number"
              defaultValue={defaultValue?.score}
              disabled
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="created_at">Created At</Label>
            <Input
              id="created_at"
              placeholder="Created At"
              defaultValue={
                defaultValue?.created_at
                  ? new Date(defaultValue.created_at).toISOString()
                  : ""
              }
              disabled
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="updated_at">Updated At</Label>
            <Input
              id="updated_at"
              placeholder="Updated At"
              defaultValue={
                defaultValue?.updated_at
                  ? new Date(defaultValue.updated_at).toISOString()
                  : ""
              }
              disabled
            />
          </div>
        </div>
      </form>
    </div>
  );
}
