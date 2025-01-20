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
  username: string;
}

export interface Question {
  commented: number;
  created_at: string;
  description: string;
  id: number;
  is_public: boolean;
  is_system_question: boolean;
  owner: Owner;
  rate: number;
  start_code: string;
  submitted: number;
  test_cases: TestCase[];
  title: string;
}
