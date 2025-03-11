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
import { BackendClient } from "@/lib/request";
import { isErrorResponse } from "@/types/payload";
import Link from "next/link";
import { FormEvent, useRef, useState, useEffect } from "react";

export default function Login() {
  const setAlert = useAlertContext();
  const setFullLoading = useFullLoadingContext();
  const client = new BackendClient();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [ref, setRef] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [resendCountdown, setResendCountdown] = useState<number>(300); // 5 minutes in seconds
  const [otpSent, setOtpSent] = useState<boolean>(false);

  useEffect(() => {
    if (otpSent && resendCountdown > 0) {
      const timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, resendCountdown]);

  const handleGetOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if(otp && ref) {
        return handleGetTokenSubmit(event);
    }

    event.preventDefault();
    setFullLoading(true);
    const form = formRef.current;
    const email = form?.email?.value ?? "";
    const response = await client.resetPasswordGetOtp(email);

    if (isErrorResponse(response)) {
      setFullLoading(false);
      setAlert("Error", response.message, 0, true);
      return;
    }

    setRef(response.ref);
    setOtpSent(true);
    setResendCountdown(300);
    setFullLoading(false);
  };

  const handleGetTokenSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFullLoading(true);
    const form = formRef.current;
    const email = form?.email?.value ?? "";
    const code = form?.otp?.value ?? "";

    const response = await client.resetPasswordGetToken({
        email, code, ref
    });

    if (isErrorResponse(response)) {
      setFullLoading(false);
      setAlert("Error", response.message, 0, true);
      return;
    }

    setFullLoading(false);
    window.location.href = "/reset-password?token=" + response.token
  };

  const handleResendOtp = async () => {
    setFullLoading(true);
    const form = formRef.current;
    const email = form?.email?.value ?? "";

    const response = await client.resetPasswordGetOtp(email);

    if (isErrorResponse(response)) {
      setFullLoading(false);
      setAlert("Error", response.message, 0, true);
      return;
    }

    setRef(response.ref);
    setResendCountdown(300); 
    setFullLoading(false);
    setAlert("Success", "OTP resent to your email.", 0, false);
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reset password</CardTitle>
              <CardDescription>
                Enter your email below to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleGetOtpSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tongla@hub.com"
                      required
                      disabled={otpSent}
                    />
                  </div>

                  {otpSent && (
                    <div className="grid gap-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                      <div className="text-sm text-muted-foreground">
                        Ref: <span className="font-mono">{ref}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={otpSent ? otp.length < 6 : false}>
                    Submit
                  </Button>

                  {otpSent && (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        onClick={handleResendOtp}
                        className="w-full"
                        disabled={resendCountdown > 0}
                      >
                        Resend OTP {resendCountdown > 0 && `(${formatCountdown(resendCountdown)})`}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-6 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/sign-up" className="underline underline-offset-4">
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
