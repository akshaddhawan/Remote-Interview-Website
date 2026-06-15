"use client";

import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { CodeIcon, BellIcon } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import DasboardBtn from "./DasboardBtn";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Badge } from "./ui/badge";

function Navbar() {
  const interviews = useQuery(api.interviews.getAllInterviews);
  const upcomingCount = interviews?.filter((i) => {
    const now = new Date();
    return new Date(i.startTime) > now && i.status === "upcoming";
  }).length;

  return (
    <nav className="sticky top-0 z-50 glass-heavy border-b border-border/50">
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* LEFT SIDE - LOGO */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold text-2xl mr-6 font-mono transition-all duration-300"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/30 transition-all duration-300" />
            <CodeIcon className="relative size-8 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="gradient-text font-bold tracking-tight">
            CodeSync
          </span>
        </Link>

        {/* RIGHT SIDE - ACTIONS */}
        <SignedIn>
          <div className="flex items-center gap-3 ml-auto">
            <DasboardBtn />

            {/* Notification Bell */}
            {upcomingCount !== undefined && upcomingCount > 0 && (
              <div className="relative">
                <BellIcon className="size-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
                <Badge className="absolute -top-2 -right-2 size-4 p-0 flex items-center justify-center text-[10px] animate-bounce-subtle">
                  {upcomingCount}
                </Badge>
              </div>
            )}

            <ModeToggle />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all",
                },
              }}
            />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}
export default Navbar;
