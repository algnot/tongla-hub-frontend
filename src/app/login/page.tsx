"use client";
import { useAlertContext } from "@/components/provider/alert-provider";
import { useFullLoadingContext } from "@/components/provider/full-loading-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackendClient, OpenIdClient } from "@/lib/request";
import { isErrorResponse } from "@/types/payload";
import Link from "next/link";
import { FormEvent, useRef } from "react";
import { useSearchParams } from 'next/navigation'

export default function Login() {
  const setAlert = useAlertContext();
  const setFullLoading = useFullLoadingContext();
  const client = new BackendClient();
  const openIdClient = new OpenIdClient();
  const formRef = useRef<HTMLFormElement | null>(null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFullLoading(true);
    const form = formRef.current;
    const email = form?.email?.value ?? "";
    const password = form?.password?.value ?? "";

    const response = await client.login({
      email,
      password,
    });

    if (isErrorResponse(response)) {
      setFullLoading(false);
      setAlert("Error", response.message, 0, true);
      return;
    }

    setAlert(
      "Login Complete",
      `Welcome back ${response.username} :)`,
      () => {
        window.location.href = redirect ?? "/dashboard/problems";
      },
      false
    );
  };

  const handleLoginWithOpenID = async () => {
    const redirectUri = await openIdClient.getAuthorizationEndpoint()
    if (redirectUri === ""){
      return 
    } 
    window.location.href = redirectUri;
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
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
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                  <Button type="button" className="w-full" onClick={handleLoginWithOpenID}>
                    Login With Open ID
                  </Button>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="mt-6 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href={`/sign-up${redirect ? "?redirect=" + redirect : ""}`} className="underline underline-offset-4">
                    Sign up
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
