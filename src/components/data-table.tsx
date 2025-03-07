"use client";

import { useEffect, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorResponse, isErrorResponse } from "@/types/payload";
import { useAlertContext } from "@/components/provider/alert-provider";

interface DataTableProps<T> {
  fetchData: (
    limit: number,
    offset: number | "",
    filter: string
  ) => Promise<PaginatedResponse<T> | ErrorResponse>;
  columns?: Array<{ key: keyof T; label: string }>;
  href?: string;
  navigateKey?: keyof T;
  isSearchable?: boolean;
}

interface PaginatedResponse<T> {
  datas: T[];
  next: number;
}

export function DataTable<T>({
  fetchData,
  columns,
  href,
  navigateKey,
  isSearchable,
}: DataTableProps<T>) {
  const setAlert = useAlertContext();
  const [datas, setDatas] = useState<T[][]>([]);
  const [page, setPage] = useState<number>(0);
  const [filter, setFilter] = useState<string>("");
  const [nextIds, setNextIds] = useState<number[]>([]);
  const [limit, setLimit] = useState<number>(10);

  const onFetchData = async (
    offset: number | "",
    filter: string,
    limit: number,
    reset: boolean = false
  ) => {
    const response = await fetchData(limit, offset, filter);

    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      return;
    }

    const { datas, next } = response;

    if (reset) {
      setDatas([datas]);
      setNextIds([next]);
      setPage(0);
    } else {
      setDatas((prev) => [...prev, datas]);
      setNextIds((prev) => [...prev, next]);
    }
  };

  useEffect(() => {
    onFetchData("", filter, limit, true);
  }, [limit]);

  const onNextPage = () => {
    if (nextIds[page] === -1) return;

    onFetchData(nextIds[page], filter, limit);
    setPage((prev) => prev + 1);
  };

  const onPrevPage = () => {
    if (page === 0) return;

    setNextIds((prev) => prev.slice(0, -1));
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const onFilter = (text: string) => {
    setFilter(text);
    onFetchData("", text, limit, true);
  };

  const onChangeLimit = (newLimit: number) => {
    setLimit(newLimit);
    onFetchData("", filter, newLimit, true);
  };

  const onNavigate = (data: T) => {
    if (href === undefined) {
      return;
    }
    if (navigateKey === undefined) {
      window.location.href = `${href}`;
      return;
    }
    window.location.href = `${href}${(data[navigateKey] ?? "") as string}`;
  };
  const columnNames =
    columns ||
    Object.keys(datas[0]?.[0] || {}).map((key) => ({ key, label: key }));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4">
        {isSearchable ? (
          <Input
            placeholder="filter here"
            className="max-w-sm"
            value={filter}
            onChange={(e) => onFilter(e.target.value)}
          />
        ) : (
          <div></div>
        )}
        <div className="flex space-x-4 items-center">
          <Select
            value={limit.toString()}
            onValueChange={(value) => onChangeLimit(Number(value))}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Select records per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-end justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={nextIds[page] === -1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columnNames.map(({ label }) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {datas[page]?.length ? (
              datas[page].map((data, index) => (
                <TableRow
                  key={index}
                  className={href ? "cursor-pointer" : ""}
                  onClick={() => onNavigate(data)}
                >
                  {columnNames.map(({ key }) => (
                    <TableCell key={Math.random()}>
                      {typeof data[key as keyof T] === "boolean" ? (
                        data[key as keyof T] ? (
                          <span className="icon-true">✅</span>
                        ) : (
                          <span className="icon-false">❌</span>
                        )
                      ) : (
                        (data[key as keyof T] as ReactNode)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnNames.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {page + 1}: {datas[page]?.length || 0} data(s) displayed
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={page === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={nextIds[page] === -1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
