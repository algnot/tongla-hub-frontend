"use client"
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { useEffect } from "react";

export default function Page() {
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();

  useEffect(() => {
    setLoading(true);
    setNavigation([], "Home");
  }, [setLoading, setNavigation])

  return (
    <div>

    </div>
  );
}
