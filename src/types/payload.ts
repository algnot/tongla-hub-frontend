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

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
}

export interface GetUserInfoResponse {
    email: string;
    image_url: string;
    role: "USER" | "ADMIN";
    user_id: number;
    username: string;
}

export interface SignupResponse {
    access_token: string;
    email: string;
    image_url: string;
    refresh_token: string;
    role: "USER" | "ADMIN" | "";
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
    role: "USER" | "ADMIN" | "";
    user_id: number;
    username: string;
}

export interface GetUserResponse {
    next: number;
    datas: UserType[];
}
