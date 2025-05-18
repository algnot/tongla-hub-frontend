export interface UserType {
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  image_url: string;
  uid: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isUserType = (data: any): data is UserType => {
  return (
    typeof data.email === "string" &&
    typeof data.username === "string" &&
    typeof data.role === "string" &&
    typeof data.image_url === "string" &&
    typeof data.uid === "number"
  );
};


export interface ExecuteCodeRequest {
  stdin: string;
  code: string;
}

export interface ExecuteCodeResponse {
  stdout: string;
  stderr: string;
  runtime: number;
  runtime_unit: string;
}

export interface TestCase {
  expected: string;
  expected_run_time_ms: number;
  id: number;
  input: string;
}

export interface Owner {
  id: number;
  username: string;
}

export interface Question {
  commented: number;
  created_at: string;
  description: string;
  id: number;
  is_public: boolean;
  is_system_question: boolean;
  submit_info: SubmitInfo;
  owner: Owner;
  rate: number;
  start_code: string;
  answer_code: string;
  submitted: number;
  test_cases: TestCase[];
  title: string;
}

export interface SubmitInfoInfo {
  description: string;
  expected_output: string;
  expected_run_time_ms: number;
  output: ExecuteCodeResponse;
  score: number;
  test_case_id: number;
}

export interface SubmitInfo {
  id: number;
  code: string;
  max_score: number;
  score: number;
  status: "PENDING" | "FINISH";
  info: SubmitInfoInfo[];
}

export interface SubmitCodeRequest {
  question_id: number;
  code: string;
}

export interface SubmitCodeResponse {
  id: number;
  status: "PENDING" | "FINISH";
}

export interface GetUserByIdResponse {
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  image_url: string;
  uid: number;
  created_at: string;
  updated_at: string;
  score: string;
}

export interface UpdateUserByIdRequest {
  email?: string;
  username?: string;
  role?: "USER" | "ADMIN";
  image_url?: string;
}

export interface UploadFileResponse {
  url: string;
}

export interface OpenIdConfigurationResponse{
  authorization_endpoint: string;
  id_token_signing_alg_values_supported: string[];
  issuer: string;
  jwks_uri: string;
  response_types_supported: string[];
  subject_types_supported: string[];
  token_endpoint: string;
  userinfo_endpoint: string;
}

export interface OpenIdTokenResponse{
  
    access_token: string;
    expires_in: number;
    id_token: string;
    token_type: string;

}