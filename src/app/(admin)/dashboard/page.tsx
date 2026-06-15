"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import toast from "react-hot-toast";
import LoaderUI from "@/components/LoaderUI";
import { getCandidateInfo, groupInterviews } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { INTERVIEW_CATEGORY } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  VideoIcon,
  UsersIcon,
  TrendingUpIcon,
  BarChart3Icon,
} from "lucide-react";
import { format } from "date-fns";
import CommentDialog from "@/components/CommentDialog";
import { StatsCard } from "@/components/StatsCards";

type Interview = Doc<"interviews">;

function DashboardPage() {
  const users = useQuery(api.users.getUsers);
  const interviews = useQuery(api.interviews.getAllInterviews);
  const updateStatus = useMutation(api.interviews.updateInterviewStatus);

  const handleStatusUpdate = async (interviewId: Id<"interviews">, status: string) => {
    try {
      await updateStatus({ id: interviewId, status });
      toast.success(`Interview marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (!interviews || !users) return <LoaderUI />;

  const groupedInterviews = groupInterviews(interviews);

  // Stats
  const totalInterviews = interviews.length;
  const completedCount = interviews.filter((i) =>
    ["completed", "succeeded", "failed"].includes(i.status)
  ).length;
  const passCount = interviews.filter((i) => i.status === "succeeded").length;
  const passRate = completedCount > 0 ? Math.round((passCount / completedCount) * 100) : 0;
  const uniqueCandidates = new Set(interviews.map((i) => i.candidateId)).size;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage interviews and track candidate progress</p>
        </div>
        <Link href="/schedule">
          <Button className="gap-2 glow-sm hover:glow-md transition-all">
            <CalendarIcon className="size-4" />
            Schedule New Interview
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <StatsCard
          label="Total Interviews"
          value={totalInterviews}
          icon={<VideoIcon className="size-6 text-primary" />}
        />
        <StatsCard
          label="Candidates"
          value={uniqueCandidates}
          icon={<UsersIcon className="size-6 text-blue-400" />}
          color="blue-400"
        />
        <StatsCard
          label="Pass Rate"
          value={passRate}
          icon={<TrendingUpIcon className="size-6 text-emerald-400" />}
          trend={passRate > 50 ? "↑ Good performance" : undefined}
          color="emerald-400"
        />
        <StatsCard
          label="Completed"
          value={completedCount}
          icon={<BarChart3Icon className="size-6 text-purple-400" />}
          color="purple-400"
        />
      </div>

      {/* Interview Categories */}
      <div className="space-y-8">
        {INTERVIEW_CATEGORY.map(
          (category) =>
            groupedInterviews[category.id]?.length > 0 && (
              <section key={category.id} className="animate-slide-up">
                {/* CATEGORY TITLE */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold">{category.title}</h2>
                  <Badge variant={category.variant}>
                    {groupedInterviews[category.id].length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedInterviews[category.id].map((interview: Interview) => {
                    const candidateInfo = getCandidateInfo(users, interview.candidateId);
                    const startTime = new Date(interview.startTime);

                    return (
                      <Card
                        key={interview._id}
                        className="group border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                      >
                        {/* CANDIDATE INFO */}
                        <CardHeader className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                              <AvatarImage src={candidateInfo.image} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                {candidateInfo.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base group-hover:text-primary transition-colors">
                                {candidateInfo.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">{interview.title}</p>
                            </div>
                          </div>
                        </CardHeader>

                        {/* DATE & TIME */}
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {format(startTime, "MMM dd")}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ClockIcon className="h-3.5 w-3.5" />
                              {format(startTime, "hh:mm a")}
                            </div>
                          </div>
                        </CardContent>

                        {/* PASS & FAIL BUTTONS */}
                        <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                          {interview.status === "completed" && (
                            <div className="flex gap-2 w-full">
                              <Button
                                className="flex-1 gap-1.5"
                                onClick={() =>
                                  handleStatusUpdate(interview._id, "succeeded")
                                }
                              >
                                <CheckCircle2Icon className="h-4 w-4" />
                                Pass
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1 gap-1.5"
                                onClick={() =>
                                  handleStatusUpdate(interview._id, "failed")
                                }
                              >
                                <XCircleIcon className="h-4 w-4" />
                                Fail
                              </Button>
                            </div>
                          )}
                          <CommentDialog interviewId={interview._id} />
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )
        )}
      </div>
    </div>
  );
}
export default DashboardPage;
