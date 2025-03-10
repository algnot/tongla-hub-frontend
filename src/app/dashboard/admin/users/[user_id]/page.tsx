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
  const formRef = useRef<HTMLFormElement | null>(null);

  const fetchData = async () => {
    const { user_id } = await params;
    const userId = Array.isArray(user_id) ? user_id[0] : user_id;
    const response = await client.getUserById(userId);

    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      setLoading(false);
      return;
    }

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
          <div className="flex justify-end">
            <Button type="submit" className="w-fit">
              save
            </Button>
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
            <Label htmlFor="start_date">username</Label>
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
            <Label htmlFor="start_date">email</Label>
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
            <Label htmlFor="start_date">image_url</Label>
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
