"use client";
import { useHelperContext } from "@/components/provider/helper-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isErrorResponse } from "@/types/payload";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useRef } from "react";

export default function SignUp() {
  const { setFullLoading, setAlert, backendClient } = useHelperContext()();
  const formRef = useRef<HTMLFormElement | null>(null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = formRef.current;
    const email = form?.email?.value ?? "";
    const username = form?.username?.value ?? "";
    const password = form?.password?.value ?? "";
    const confirmPassword = form?.confirmPassword?.value ?? "";

    if (password != confirmPassword) {
      setAlert("Error", "password and confirm password not match", 0, true);
      return;
    }
    setFullLoading(true);
    const response = await backendClient.signUp({
      username,
      email,
      password,
    });
    setFullLoading(false);

    if (isErrorResponse(response)) {
      return;
    }

    window.location.href = redirect ?? "/dashboard";
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign up</CardTitle>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tongla@hub.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="tongla"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign up
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm">
                  I have an account{" "}
                  <Link
                    href={`/login${redirect ? "?redirect=" + redirect : ""}`}
                    className="underline underline-offset-4"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
