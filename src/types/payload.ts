import { UserType } from "./user";

export interface ErrorResponse {
    status: boolean;
    message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isErrorResponse = (data: any): data is ErrorResponse => {
  return (
    typeof data.status === "boolean" &&
    typeof data.message === "string"
  );
};

export interface GetUserInfoResponse {
    email: string;
    image_url: string;
    role: "USER" | "ADMIN";
    user_id: number;
    username: string;
}

export interface SignUpRequest {
    username: string;
    email: string;
    password: string;
}

export interface SignUpResponse {
    access_token: string;
    email: string;
    image_url: string;
    refresh_token: string;
    role: "USER" | "ADMIN";
    user_id: number;
    username: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    email: string;
    image_url: string;
    refresh_token: string;
    role: "USER" | "ADMIN";
    user_id: number;
    username: string;
}

export interface ResetPasswordGetOtpResponse {
    email: string;
    expires_at: string;
    mapper_key: string;
    mapper_value: string;
    ref: string;
}

export interface ResetPasswordGetTokenRequest {
    email: string;
    code: string;
    ref: string;
}

export interface ResetPasswordGetTokenResponse {
    token: string;
}

export interface ResetPasswordResponse {
    access_token: string;
    refresh_token: string;
}

export interface GetUserResponse {
    next: number;
    datas: UserType[];
}

export interface EmailSender {
    id: number;
    reason: string;
    send_at: string;
    status: number;
    template_id: string;
    to_email: string;
}

export interface GetEmailSenderResponse {
    next: number;
    datas: EmailSender[];
}

export interface EmailSender {
    id: number;
    reason: string;
    send_at: string;
    status: number;
    template_id: string;
    to_email: string;
}

export interface OneTimePassword {
    id: number;
    code: string;
    ref: string;
    used: boolean;
    expires_at: string;
}

export interface GetOneTimePasswordResponse {
    next: number;
    datas: OneTimePassword[];
}
