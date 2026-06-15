"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import { Loader2Icon, CalendarIcon, UsersIcon, TrendingUpIcon, VideoIcon } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";
import { StatsCard } from "@/components/StatsCards";

export default function Home() {
  const router = useRouter();

  const { isInterviewer, isCandidate, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const allInterviews = useQuery(api.interviews.getAllInterviews);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  if (isLoading) return <LoaderUI />;

  // Calculate stats
  const totalInterviews = allInterviews?.length ?? 0;
  const upcomingCount = allInterviews?.filter((i) => i.status === "upcoming").length ?? 0;
  const completedCount = allInterviews?.filter((i) =>
    ["completed", "succeeded", "failed"].includes(i.status)
  ).length ?? 0;
  const passRate = completedCount > 0
    ? Math.round(
        ((allInterviews?.filter((i) => i.status === "succeeded").length ?? 0) / completedCount) * 100
      )
    : 0;

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 glass p-8 animate-fade-in">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-chart-2/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            {isInterviewer ? "Interviewer Dashboard" : "Candidate Portal"}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Welcome back
            <span className="gradient-text">!</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl leading-relaxed">
            {isInterviewer
              ? "Manage your interviews, review candidates, and leverage AI-powered insights to make better hiring decisions."
              : "Access your upcoming interviews, review preparations, and track your progress."}
          </p>
        </div>
      </div>

      {isInterviewer ? (
        <>
          {/* STATS ROW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up stagger-1">
            <StatsCard
              label="Total Interviews"
              value={totalInterviews}
              icon={<VideoIcon className="size-6 text-primary" />}
            />
            <StatsCard
              label="Upcoming"
              value={upcomingCount}
              icon={<CalendarIcon className="size-6 text-blue-400" />}
              color="blue-400"
            />
            <StatsCard
              label="Candidates"
              value={totalInterviews}
              icon={<UsersIcon className="size-6 text-purple-400" />}
              color="purple-400"
            />
            <StatsCard
              label="Pass Rate"
              value={passRate}
              icon={<TrendingUpIcon className="size-6 text-emerald-400" />}
              trend={passRate > 50 ? "↑ Above average" : undefined}
              color="emerald-400"
            />
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {QUICK_ACTIONS.map((action, index) => (
                <div key={action.title} className="animate-slide-up" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                  <ActionCard
                    action={action}
                    onClick={() => handleQuickAction(action.title)}
                  />
                </div>
              ))}
            </div>
          </div>

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />
        </>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold">Your Interviews</h1>
            <p className="text-muted-foreground mt-1">View and join your scheduled interviews</p>
          </div>

          <div className="mt-8">
            {interviews === undefined ? (
              <div className="flex justify-center py-12">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : interviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {interviews.map((interview, index) => (
                  <div key={interview._id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <MeetingCard interview={interview} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <CalendarIcon className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No interviews scheduled</h3>
                <p className="text-muted-foreground">You have no scheduled interviews at the moment</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
