"use client";

import { UserType } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<UserType>[] = [
  {
    accessorKey: "uid",
    header: "id",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "username",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
];
