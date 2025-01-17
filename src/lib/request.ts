import { ErrorResponse, LoginRequest, LoginResponse, SignupRequest, SignupResponse } from "@/types/payload";
import axios, { AxiosInstance } from "axios";
import { getItem, setItem } from "./storage";
import { UserType } from "@/types/user";

export class BackendClient {
  client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_PATH,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  handlerError(error: unknown): ErrorResponse {
    if (axios.isAxiosError(error)) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return {
          status: false,
          message: error.response.data.message,
        };
      } else {
        return {
          status: false,
          message: error.message,
        };
      }
    } else {
      return {
        status: false,
        message: "An unknow error occurred. try again!",
      };
    }
  }

  async getUserInfo(): Promise<UserType | ErrorResponse> {
    try {
      const accessToken = await getItem("access_token");
      const response = await this.client.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setItem("user_data", response.data);
      return response.data;
    } catch (e) {
      return this.handlerError(e);
    }
  }

  async signup(
    payload: SignupRequest
  ): Promise<SignupResponse | ErrorResponse> {
    try {
      const response = await this.client.post("/auth/sign-up", payload);
      setItem("access_token", response.data.access_token);
      setItem("refresh_token", response.data.refresh_token);
      return response.data;
    } catch (e) {
      return this.handlerError(e);
    }
  }

  async login(
    payload: LoginRequest
  ): Promise<LoginResponse | ErrorResponse> {
    try {
      const response = await this.client.post("/auth/login", payload);
      setItem("access_token", response.data.access_token);
      setItem("refresh_token", response.data.refresh_token);
      await this.getUserInfo();
      return response.data;
    } catch (e) {
      return this.handlerError(e);
    }
  }
}
