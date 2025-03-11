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
  GetUserByIdResponse,
  Question,
  SubmitCodeRequest,
  SubmitCodeResponse,
  UpdateUserByIdRequest,
  UploadFileResponse,
  UserType,
} from "@/types/request";

const handlerError = (error: unknown): ErrorResponse => {
  if (axios.isAxiosError(error)) {
    if (error.response && error.response.data && error.response.data.message) {
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
};

const client: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_PATH,
  headers: {
    "Content-Type": "application/json",
  },
});

export class BackendClient {
  async getUserInfo(): Promise<UserType | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setItem("user_data", response.data);
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.status === 403) {
        removeItem("access_token");
        const refreshToken = getItem("refresh_token");
        if (refreshToken) {
          await this.generateNewAccessToken();
          return this.getUserInfo();
        }
        return {
          email: "",
          username: "",
          role: "USER",
          image_url: "",
          uid: 0,
        };
      }
      return handlerError(e);
    }
  }

  async generateNewAccessToken(): Promise<ErrorResponse | void> {
    try {
      const refreshToken = getItem("refresh_token");
      const response = await client.get("/auth/generate-access-token", {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      setItem("access_token", response.data.access_token);
    } catch (e) {
      if (axios.isAxiosError(e) && e.status === 403) {
        removeItem("access_token");
        removeItem("refresh_token");
        removeItem("user_data");
      }
      return handlerError(e);
    }
  }

  async signUp(
    payload: SignUpRequest
  ): Promise<SignUpResponse | ErrorResponse> {
    try {
      const response = await client.post("/auth/sign-up", payload);
      setItem("access_token", response.data.access_token);
      setItem("refresh_token", response.data.refresh_token);
      await this.getUserInfo();
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async login(payload: LoginRequest): Promise<LoginResponse | ErrorResponse> {
    try {
      const response = await client.post("/auth/login", payload);
      setItem("access_token", response.data.access_token);
      setItem("refresh_token", response.data.refresh_token);
      await this.getUserInfo();
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async resetPasswordGetOtp(
    email: string
  ): Promise<ResetPasswordGetOtpResponse | ErrorResponse> {
    try {
      const response = await client.post("/auth/reset-password-otp", {
        email,
      });
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async resetPasswordGetToken(
    payload: ResetPasswordGetTokenRequest
  ): Promise<ResetPasswordGetTokenResponse | ErrorResponse> {
    try {
      const response = await client.post("/auth/reset-password-token", payload);
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async resetPassword(
    password: string,
    token: string
  ): Promise<UserType | ErrorResponse> {
    try {
      const response = await client.post(
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
      return handlerError(e);
    }
  }

  async getUser(
    limit: number,
    offset: number | "",
    text: string
  ): Promise<GetUserResponse | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.get(
        `/data/list?limit=${limit}&offset=${offset}&text=${text}&model=user`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.status === 403) {
        removeItem("access_token");
        const refreshToken = getItem("refresh_token");
        if (refreshToken) {
          await this.generateNewAccessToken();
          return this.getUser(limit, offset, text);
        }
      }
      return handlerError(e);
    }
  }

  async getEmailSender(
    limit: number,
    offset: number | "",
    text: string
  ): Promise<GetEmailSenderResponse | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.get(
        `/data/list?limit=${limit}&offset=${offset}&text=${text}&model=email`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.status === 403) {
        removeItem("access_token");
        const refreshToken = getItem("refresh_token");
        if (refreshToken) {
          await this.generateNewAccessToken();
          return this.getEmailSender(limit, offset, text);
        }
      }
      return handlerError(e);
    }
  }

  async getOneTimePassword(
    limit: number,
    offset: number | "",
    text: string
  ): Promise<GetOneTimePasswordResponse | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.get(
        `/data/list?limit=${limit}&offset=${offset}&text=${text}&model=otp`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.status === 403) {
        removeItem("access_token");
        const refreshToken = getItem("refresh_token");
        if (refreshToken) {
          await this.generateNewAccessToken();
          return this.getOneTimePassword(limit, offset, text);
        }
      }
      return handlerError(e);
    }
  }

  async getQuestionAdmin(
    limit: number,
    offset: number | "",
    text: string
  ): Promise<GetQuestionAdminResponse | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.get(
        `/data/list?limit=${limit}&offset=${offset}&text=${text}&model=question`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.status === 403) {
        removeItem("access_token");
        const refreshToken = getItem("refresh_token");
        if (refreshToken) {
          await this.generateNewAccessToken();
          return this.getQuestionAdmin(limit, offset, text);
        }
      }
      return handlerError(e);
    }
  }

  async getQuestion(
    limit: number,
    offset: number | "",
    mode: "all" | "submitted" | "not_submitted",
    rate: "all" | "1" | "2" | "3" | "4" | "5",
  ): Promise<GetQuestionResponse | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.get(
        `/code/list-question?limit=${limit}&offset=${offset}&mode=${mode}&rate=${rate}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.status === 403) {
        removeItem("access_token");
        const refreshToken = getItem("refresh_token");
        if (refreshToken) {
          await this.generateNewAccessToken();
          return this.getQuestion(limit, offset, mode, rate);
        }
      }
      return handlerError(e);
    }
  }

  async executeCode(
    payload: ExecuteCodeRequest
  ): Promise<ExecuteCodeResponse | ErrorResponse> {
    try {
      const response = await client.post("/code/execute", payload);
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async getQuestionById(id: string): Promise<Question | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.get(`/code/get-question-by-id?id=${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async addQuestion(
    payload: CreateQuestionRequest
  ): Promise<Question | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.post(`/code/add-question`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async updateQuestion(
    payload: UpdateQuestionRequest
  ): Promise<Question | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.put(`/code/update-question`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async submitCode(payload: SubmitCodeRequest): Promise<SubmitCodeResponse | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.post(`/code/submit`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async getUserById(id: string): Promise<GetUserByIdResponse | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.get(`/user/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async updateUserById(id: string, payload: UpdateUserByIdRequest): Promise<GetUserByIdResponse | ErrorResponse> {
    try {
      const accessToken = getItem("access_token");
      const response = await client.put(`/user/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }

  async uploadFile(fileType: string, fileContent: string): Promise<UploadFileResponse | ErrorResponse> {
    try {
      const response = await client.post("/uploader/upload", {
        content_type: fileType,
        content: fileContent
      });
      return response.data;
    } catch (e) {
      return handlerError(e);
    }
  }
}
