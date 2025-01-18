import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { removeItem } from "./storage"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function logout() {
  removeItem("access_token");
  removeItem("refresh_token");
  removeItem("user_data");
  window.location.href = "/login"
}
