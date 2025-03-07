"use client";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { useEffect, useState } from "react";
import { BackendClient } from "@/lib/request";
import { Star, CircleSlash, CircleX } from "lucide-react";
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
import { useAlertContext } from "@/components/provider/alert-provider";

export default function Page() {
  const client = new BackendClient();
  const setLoading = useLoadingContext();
  const setNavigation = useNavigateContext();
  const setAlert = useAlertContext();

  const [rating, setRating] = useState<number>(0);
  const [state, setState] = useState<"all" | "notSubmit" | "submited">("all");
  const [problems, setProblems] = useState<GetQuestion[]>([]);

  const fetchData = async () => {
    const response = await client.getQuestion(20, 0);

    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      setLoading(false);
      return;
    }

    setProblems(response.datas)
  };

  useEffect(() => {
    setLoading(false);
    setNavigation([], "All Problems");
    fetchData();
  }, [setLoading, setNavigation]);

  return (
    <div className="container mx-auto py-10 px-5">
      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <Button
            variant={state == "all" ? "default" : "outline"}
            onClick={() => setState("all")}
          >
            All Problems
          </Button>
          <Button
            variant={state == "notSubmit" ? "default" : "outline"}
            onClick={() => setState("notSubmit")}
          >
            Not Sumbit
          </Button>
          <Button
            variant={state == "submited" ? "default" : "outline"}
            onClick={() => setState("submited")}
          >
            Submitted
          </Button>
        </div>
        <div>
          <Select
            value={rating.toString()}
            onValueChange={(value) => setRating(Number(value))}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">1 - 5 ⭐</SelectItem>
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
        {problems.map((value) => {
          return <ProblemCard key={value.id} problem={value} />;
        })}
      </div>
    </div>
  );
}
