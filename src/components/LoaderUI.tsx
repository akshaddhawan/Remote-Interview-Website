import { CodeIcon } from "lucide-react";

function LoaderUI() {
  return (
    <div className="h-[calc(100vh-4rem-1px)] flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
        {/* Orbital ring */}
        <div className="relative size-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin-slow" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary/60 animate-spin-slow" style={{ animationDirection: "reverse" }} />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <CodeIcon className="size-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Loading text */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Loading</span>
          <span className="flex gap-1">
            <span className="size-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="size-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="size-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
export default LoaderUI;
