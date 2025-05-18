"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function RedirectPage() {
  useEffect(() => {
    // if (process.env.NODE_ENV === "development") {
    window.location.href = "/dashboard";
    // } else {
    //   window.location.href = "https://tongla.dev/";
    // }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="mt-4 text-2xl text-[#f3901d]">Redirecting.. 🏃</p>
      <p className="mt-2 text-gray-500">
        Redirecting to tongla.dev. Click the button below if you are not
        redirected automatically.
      </p>
      <Link
        href="https://tongla.dev/"
        className="mt-6 px-4 py-2 bg-[#d3901d] text-white rounded hover:bg-[#f3901d]"
      >
        Go to tongla.dev
      </Link>
    </div>
  );
}
