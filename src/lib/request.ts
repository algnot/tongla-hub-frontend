import {
  CreateQuestionRequest,
  ErrorResponse,
  GetEmailSenderResponse,
  GetOneTimePasswordResponse,
  GetQuestionAdminResponse,
  GetQuestionResponse,
  GetUserResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordGetOtpResponse,
  ResetPasswordGetTokenRequest,
  ResetPasswordGetTokenResponse,
  SignUpRequest,
  SignUpResponse,
  UpdateQuestionRequest,
} from "@/types/payload";
import axios, { AxiosInstance } from "axios";
import { getItem, removeItem, setItem } from "./storage";
import {
  ExecuteCodeRequest,
  ExecuteCodeResponse,
  GetOpenidTokenRequest,
  GetUserByIdResponse,
  Question,
  SubmitCodeRequest,
  SubmitCodeResponse,
  UpdateUserByIdRequest,
  UploadFileResponse,
  UserType,
} from "@/types/request";

const handlerError = (error: unknown, setAlert: (message: string, type: string, action: number | (() => void), isOpen: boolean) => void): ErrorResponse => {
  if (axios.isAxiosError(error)) {
    if (error.status === 403) {
      return {
        status: false,
        message: "Session expired. Please login again.",
      };
    } else if (error.response && error.response.data && error.response.data.redirect) {
      window.location.href = error.response.data.redirect;
      return {
        status: false,
        message: "Redirecting to " + error.response.data.redirect,
      };
    } else if (error.response && error.response.data && error.response.data.message) {
      setAlert("error", error.response.data.error, () => { }, false);
      return {
        status: false,
        message: error.response.data.message,
      };
    } else {
      setAlert("error", error.message, () => { }, false);
      return {
        status: false,
        message: error.message,
      };
    }
  } else {
    setAlert("An unknown error occurred. Try again!", "error", 0, false);
    return {
      status: false,
      message: "An unknow error occurred. try again!",
    };
  }
};

export class BackendClient {
  private readonly client: AxiosInstance;
  private readonly plainClient: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private readonly setAlert: (message: string, type: string, action: number | (() => void), isOpen: boolean) => void;

  constructor(setAlert: (message: string, type: string, action: number | (() => void), isOpen: boolean) => void) {
    this.setAlert = setAlert;

    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_PATH,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getItem("access_token")}`,
      },
    });

    this.plainClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_PATH,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.response.use(
      response => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 403 && getItem("refresh_token")) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshPromise = this.refreshAccessTokenSilently().finally(() => {
              this.isRefreshing = false;
              this.refreshPromise = null;
            });
          }

          const refreshed = await this.refreshPromise;
          if (refreshed) {
            originalRequest.headers["Authorization"] = `Bearer ${getItem("access_token")}`;
            return this.client(originalRequest);
          } else {
            removeItem("refresh_token");
            removeItem("access_token");
          }
        }

        throw error;
      }
    );
  }

  async refreshAccessTokenSilently(): Promise<boolean> {
    try {
      const response = await this.plainClient.get("/auth/generate-access-token", {
        headers: {
          Authorization: `Bearer ${getItem("refresh_token")}`,
        },
      });
      setItem("access_token", response.data.access_token);
      return true;
    } catch (e) {
      console.log("Refresh token failed", e);
      return false;
    }
  }

  async getUserInfo(): Promise<UserType | ErrorResponse> {
    try {
      const response = await this.client.get("/auth/me");
      return response.data;
    } catch (e) {
      console.log(e);
      return {
        email: "",
        username: "",
        role: "USER",
        image_url: "",
        uid: 0,
      };
    }
  }

  async signUp(
    payload: SignUpRequest
  ): Promise<SignUpResponse | ErrorResponse> {
    try {
      const response = await this.client.post("/auth/sign-up", payload);
      setItem("access_token", response.data.access_token);
      setItem("refresh_token", response.data.refresh_token);
      await this.getUserInfo();
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async login(payload: LoginRequest): Promise<LoginResponse | ErrorResponse> {
    try {
      const response = await this.client.post("/auth/login", payload);
      setItem("access_token", response.data.access_token);
      setItem("refresh_token", response.data.refresh_token);
      await this.getUserInfo();
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async resetPasswordGetOtp(
    email: string
  ): Promise<ResetPasswordGetOtpResponse | ErrorResponse> {
    try {
      const response = await this.client.post("/auth/reset-password-otp", {
        email,
      });
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async resetPasswordGetToken(
    payload: ResetPasswordGetTokenRequest
  ): Promise<ResetPasswordGetTokenResponse | ErrorResponse> {
    try {
      const response = await this.client.post("/auth/reset-password-token", payload);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async resetPassword(
    password: string,
    token: string
  ): Promise<UserType | ErrorResponse> {
    try {
      const response = await this.client.post(
        "/auth/reset-password",
        {
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setItem("access_token", response.data.access_token);
      setItem("refresh_token", response.data.refresh_token);
      return await this.getUserInfo();
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async getUser(
    limit: number,
    offset: number | "",
    text: string
  ): Promise<GetUserResponse | ErrorResponse> {
    try {
      const response = await this.client.get(`/data/list?limit=${limit}&offset=${offset}&text=${text}&model=user`);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async getEmailSender(
    limit: number,
    offset: number | "",
    text: string
  ): Promise<GetEmailSenderResponse | ErrorResponse> {
    try {
      const response = await this.client.get(`/data/list?limit=${limit}&offset=${offset}&text=${text}&model=email`);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async getOneTimePassword(
    limit: number,
    offset: number | "",
    text: string
  ): Promise<GetOneTimePasswordResponse | ErrorResponse> {
    try {
      const response = await this.client.get(`/data/list?limit=${limit}&offset=${offset}&text=${text}&model=otp`);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async getQuestionAdmin(
    limit: number,
    offset: number | "",
    text: string
  ): Promise<GetQuestionAdminResponse | ErrorResponse> {
    try {
      const response = await this.client.get(`/data/list?limit=${limit}&offset=${offset}&text=${text}&model=question`);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async getQuestion(
    limit: number,
    offset: number | "",
    mode: "all" | "submitted" | "not_submitted",
    rate: "all" | "1" | "2" | "3" | "4" | "5",
  ): Promise<GetQuestionResponse | ErrorResponse> {
    try {
      const response = await this.client.get(`/code/list-question?limit=${limit}&offset=${offset}&mode=${mode}&rate=${rate}`);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async executeCode(
    payload: ExecuteCodeRequest
  ): Promise<ExecuteCodeResponse | ErrorResponse> {
    try {
      const response = await this.client.post("/code/execute", payload);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async getQuestionById(id: string): Promise<Question | ErrorResponse> {
    try {
      const response = await this.client.get(`/code/get-question-by-id?id=${id}`);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async addQuestion(
    payload: CreateQuestionRequest
  ): Promise<Question | ErrorResponse> {
    try {
      const response = await this.client.post(`/code/add-question`, payload);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async updateQuestion(
    payload: UpdateQuestionRequest
  ): Promise<Question | ErrorResponse> {
    try {
      const response = await this.client.put(`/code/update-question`, payload);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async submitCode(payload: SubmitCodeRequest): Promise<SubmitCodeResponse | ErrorResponse> {
    try {
      const response = await this.client.post(`/code/submit`, payload);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async getUserById(id: string): Promise<GetUserByIdResponse | ErrorResponse> {
    try {
      const response = await this.client.get(`/user/${id}`);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async updateUserById(id: string, payload: UpdateUserByIdRequest): Promise<GetUserByIdResponse | ErrorResponse> {
    try {
      const response = await this.client.put(`/user/${id}`, payload);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async uploadFile(fileType: string, fileContent: string): Promise<UploadFileResponse | ErrorResponse> {
    try {
      const response = await this.client.post("/uploader/upload", {
        content_type: fileType,
        content: fileContent
      });
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }

  async getOpenidToken(payload: GetOpenidTokenRequest): Promise<LoginResponse | ErrorResponse> {
    try {
      const response = await this.client.post("/auth/get-openid-token", payload);
      setItem("access_token", response.data.access_token);
      setItem("refresh_token", response.data.refresh_token);
      return response.data;
    } catch (e) {
      return handlerError(e, this.setAlert);
    }
  }
}
