import { CallRecording } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { calculateRecordingDuration } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { CalendarIcon, ClockIcon, CopyIcon, PlayIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

function RecordingCard({ recording }: { recording: CallRecording }) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recording.url);
      toast.success("Recording link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const formattedStartTime = recording.start_time
    ? format(new Date(recording.start_time), "MMM d, yyyy, hh:mm a")
    : "Unknown";

  const duration =
    recording.start_time && recording.end_time
      ? calculateRecordingDuration(recording.start_time, recording.end_time)
      : "Unknown duration";

  return (
    <Card className="group border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
      {/* CARD HEADER */}
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formattedStartTime}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>{duration}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Recording
          </Badge>
        </div>
      </CardHeader>

      {/* VIDEO PREVIEW */}
      <CardContent className="pb-3">
        <div
          className="w-full aspect-video bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl flex items-center justify-center cursor-pointer group/play border border-border/30 hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
          onClick={() => window.open(recording.url, "_blank")}
        >
          {/* Decorative grid pattern */}
          <div className="absolute inset-0 dot-pattern opacity-30" />

          {/* Play button */}
          <div className="size-14 rounded-2xl bg-background/90 flex items-center justify-center group-hover/play:bg-primary group-hover/play:scale-110 transition-all duration-300 shadow-lg">
            <PlayIcon className="size-6 text-muted-foreground group-hover/play:text-primary-foreground transition-colors fill-current" />
          </div>

          {/* Duration badge overlay */}
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur text-xs font-mono">
              {duration}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button
          className="flex-1 gap-2 glow-sm hover:glow-md transition-all"
          onClick={() => window.open(recording.url, "_blank")}
        >
          <PlayIcon className="size-4" />
          Play
        </Button>
        <Button variant="outline" className="border-border/50 hover:border-primary/30" onClick={handleCopyLink}>
          <CopyIcon className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
export default RecordingCard;
