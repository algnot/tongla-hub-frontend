"use client";
import { useHelperContext } from "@/components/provider/helper-provider";
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
import { isErrorResponse } from "@/types/payload";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function Login() {
  const { setFullLoading, setAlert, backendClient } = useHelperContext()();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = formRef.current;
    const password = form?.password?.value ?? "";
    const confirmPassword = form?.confirmPassword?.value ?? "";

    if (password != confirmPassword) {
        setAlert("Error", "password and confirm password not match", 0, true);
        return;
    }
    
    setFullLoading(true);

    if(!token) {
        setAlert("Error", "missing token", () => { window.location.href = "/login" }, false)
        return
    }

    const response = await backendClient.resetPassword(password, token);
    setFullLoading(false);

    if (isErrorResponse(response)) {
      return;
    }

    window.location.href = "/dashboard";
  };


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setToken(token);
    }
  }, []);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your new password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
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
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
