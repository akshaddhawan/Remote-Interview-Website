import useMeetingActions from "@/hooks/useMeetingActions";
import { Doc } from "../../convex/_generated/dataModel";
import { getMeetingStatus } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type Interview = Doc<"interviews">;

function MeetingCard({ interview }: { interview: Interview }) {
  const { joinMeeting } = useMeetingActions();

  const status = getMeetingStatus(interview);
  const formattedDate = format(new Date(interview.startTime), "EEEE, MMMM d · h:mm a");

  const statusConfig = {
    live: {
      color: "bg-emerald-500",
      label: "Live Now",
      borderColor: "border-l-emerald-500",
      badgeVariant: "default" as const,
    },
    upcoming: {
      color: "bg-blue-500",
      label: "Upcoming",
      borderColor: "border-l-blue-500",
      badgeVariant: "secondary" as const,
    },
    completed: {
      color: "bg-muted-foreground",
      label: "Completed",
      borderColor: "border-l-muted-foreground",
      badgeVariant: "outline" as const,
    },
  };

  const config = statusConfig[status];

  return (
    <Card className={`group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 border-l-4 ${config.borderColor}`}>
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {formattedDate}
          </div>

          <Badge variant={config.badgeVariant} className="gap-1.5">
            {status === "live" && (
              <span className="size-2 rounded-full bg-emerald-400 animate-live-pulse" />
            )}
            {config.label}
          </Badge>
        </div>

        <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
          {interview.title}
        </CardTitle>

        {interview.description && (
          <CardDescription className="line-clamp-2 leading-relaxed">
            {interview.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="relative pt-0">
        {status === "live" && (
          <Button
            className="w-full gap-2 glow-sm hover:glow-md transition-all duration-300"
            onClick={() => joinMeeting(interview.streamCallId)}
          >
            <span className="size-2 rounded-full bg-white animate-pulse" />
            Join Meeting
          </Button>
        )}

        {status === "upcoming" && (
          <Button variant="outline" className="w-full gap-2 border-border/50" disabled>
            <ClockIcon className="size-4" />
            Waiting to Start
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
export default MeetingCard;
