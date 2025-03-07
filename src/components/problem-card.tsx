import { GetQuestion } from "@/types/payload";
import { CircleSlash, CircleX, Star } from "lucide-react";
import Link from "next/link";
import React from "react";

export type ProblemCardProps = {
  problem: GetQuestion;
};

export default function ProblemCard({ problem }: ProblemCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          width={17}
          className={i <= rating ? "fill-primary" : ""}
        />
      );
    }
    return stars;
  };

  const rating = problem.rate || 0;

  return (
    <Link
      href={`/dashboard/problems/${problem.id}`}
      className="p-5 border rounded-md cursor-pointer flex justify-between items-center mb-3"
    >
      <div>
        <div className="text-xl mb-2">{problem.title}</div>
        <div className="flex gap-1 mt-2">
          {problem.is_submit ? (
            <div className="flex border rounded-xl border-green-600 text-green-600 text-sm justify-center items-center gap-1 w-fit px-2">
              <CircleSlash className="text-green-600" width={18} />
              Submitted
            </div>
          ) : (
            <div className="flex border rounded-xl border-red-600 text-red-600 text-sm justify-center items-center gap-1 w-fit px-2">
              <CircleSlash className="text-red-600" width={18} />
              Not submit
            </div>
          )}

          {problem.is_passed ? (
            <div className="flex border rounded-xl border-green-600 text-green-600 text-sm justify-center items-center gap-1 w-fit px-2">
              <CircleX className="text-green-600" width={18} />
              Correct
            </div>
          ) : (
            <div className="flex border rounded-xl border-red-600 text-red-600 text-sm justify-center items-center gap-1 w-fit px-2">
              <CircleX className="text-red-600" width={18} />
              Not correct
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex gap-1">{renderStars(rating)}</div>
        <div className="text-gray-400 text-sm">{problem.submitted} submitted</div>
      </div>
    </Link>
  );
}