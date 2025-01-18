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
