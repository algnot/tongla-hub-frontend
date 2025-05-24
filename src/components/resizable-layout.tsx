/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRef, useState, ReactNode, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

type ResizableLayoutProps = {
  first: ReactNode;
  second: ReactNode;
  direction?: "horizontal" | "vertical";
  initialSize?: number;
  className?: string;
  onResize?: (size: number) => void;
};

export default function ResizableSplitLayout({
  first,
  second,
  direction = "horizontal",
  initialSize,
  className = "",
  onResize = () => {},
}: ResizableLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [size, setSize] = useState<number | null>(null);

  useEffect(() => {
    if (initialSize) {
      setSize(initialSize);
      onResize?.(initialSize);
    } else if (direction === "horizontal") {
      setSize(window.innerWidth / 2 - 50);
      onResize?.(window.innerWidth / 2 - 50);
    } else {
      setSize(window.innerHeight / 2 - 50);
      onResize?.(window.innerHeight / 2 - 50);
    }
  }, [direction, initialSize]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newSize: number;

      if (direction === "horizontal") {
        newSize = e.clientX - rect.left;
        if (newSize > 100 && newSize < rect.width - 100) {
          setSize(newSize);
          onResize?.(newSize);
        }
      } else {
        newSize = e.clientY - rect.top;
        if (newSize > 100 && newSize < rect.height - 100) {
          setSize(newSize);
          onResize?.(newSize);
        }
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [direction]);

  const isDesktop = useMediaQuery({ minWidth: 768 });

  if (!isDesktop) {
    return (
      <div
        className={`flex flex-col w-full h-auto overflow-auto ${className}`}
      >
        <div className="w-full my-4">{first}</div>
        <div className="w-full my-4">{second}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${
        direction === "horizontal" ? "flex" : "flex-col"
      } w-full overflow-hidden` + " " + className}
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div
        className="overflow-auto"
        style={
          direction === "horizontal"
            ? { width: `${size}px` }
            : { height: `${size}px` }
        }
      >
        {first}
      </div>

      <div
        onMouseDown={() => (isDragging.current = true)}
        className={`relative flex items-center justify-center transition ${
          direction === "horizontal"
            ? "w-1 cursor-col-resize bg-gray-400 hover:bg-gray-500"
            : "h-1 cursor-row-resize bg-gray-400 hover:bg-gray-500"
        }`}
      >
        <div
          className={`bg-black rounded-full ${
            direction === "horizontal"
              ? "w-[2px] h-10"
              : "h-[2px] w-10"
          }`}
        />
      </div>

      <div className="flex-1 overflow-auto">{second}</div>
    </div>
  );
}
