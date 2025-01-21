"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

const LoadingContext = createContext((value: boolean) => { return value });

function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 animate-pulse" />
        <div className="aspect-video rounded-xl bg-muted/50 animate-pulse" />
        <div className="aspect-video rounded-xl bg-muted/50 animate-pulse" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min animate-pulse" />
    </div>
  );
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(false);

  const onChangeLoading = useCallback((value: boolean) => {
    setLoading(value);
    return value;
  }, []);

  return (
    <LoadingContext.Provider value={onChangeLoading}>
      {loading && <Loading />}
      <div className={`${loading && 'hidden'}`}>
        {children}
      </div>
    </LoadingContext.Provider>
  );
}

export const useLoadingContext = () => useContext(LoadingContext);
