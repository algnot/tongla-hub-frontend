"use client";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GetQuestion, isErrorResponse } from "@/types/payload";
import ProblemCard from "@/components/problem-card";
import { useSearchParams, useRouter } from "next/navigation";
import { useHelperContext } from "@/components/provider/helper-provider";

type RatingType = "all" | "1" | "2" | "3" | "4" | "5";
type StateType = "all" | "not_submitted" | "submitted";

export default function Page() {
  const { backendClient } = useHelperContext()();
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [problems, setProblems] = useState<GetQuestion[]>([]);
  const rating = (searchParams.get("rating") as RatingType) || "all";
  const state = (searchParams.get("state") as StateType) || "all";

  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const fetchData = async () => {
    const response = await backendClient.getQuestion(100, 0, state, rating);
    setLoading(false);

    if (isErrorResponse(response)) {
      return;
    }

    setProblems(response.datas);
  };

  useEffect(() => {
    setLoading(false);
    setNavigation([], "All Problems");
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rating, state]);

  return (
    <div className="container mx-auto py-10 px-5">
      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <Button
            variant={state == "all" ? "default" : "outline"}
            onClick={() => updateQueryParam("state", "all")}
          >
            All Problems
          </Button>
          <Button
            variant={state == "not_submitted" ? "default" : "outline"}
            onClick={() => updateQueryParam("state", "not_submitted")}
          >
            Not Submit
          </Button>
          <Button
            variant={state == "submitted" ? "default" : "outline"}
            onClick={() => updateQueryParam("state", "submitted")}
          >
            Submitted
          </Button>
        </div>
        <div>
          <Select
            value={rating}
            onValueChange={(value) => updateQueryParam("rating", value)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">1 - 5 ⭐</SelectItem>
              <SelectItem value="1">1 ⭐</SelectItem>
              <SelectItem value="2">2 ⭐</SelectItem>
              <SelectItem value="3">3 ⭐</SelectItem>
              <SelectItem value="4">4 ⭐</SelectItem>
              <SelectItem value="5">5 ⭐</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-5">
        {problems.length > 0 ? (
          problems.map((value) => (
            <ProblemCard key={value.id} problem={value} />
          ))
        ) : (
          <p className="text-center text-gray-500">No problems found.</p>
        )}
      </div>
    </div>
  );
}
