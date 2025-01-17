export interface ErrorResponse {
    status: boolean;
    message: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
}

export interface GetUserInfoResponse {
    email: string;
    image_url: string;
    role: "USER" | "ADMIN" | "";
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
