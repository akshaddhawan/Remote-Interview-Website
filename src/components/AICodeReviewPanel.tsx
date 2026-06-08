"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import {
  SparklesIcon,
  CheckCircle2Icon,
  ZapIcon,
  PaletteIcon,
  LightbulbIcon,
  Loader2Icon,
} from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import toast from "react-hot-toast";

interface AIReview {
  correctness: { score: number; feedback: string };
  efficiency: { score: number; feedback: string };
  codeQuality: { score: number; feedback: string };
  suggestions: string[];
  overallScore: number;
  summary: string;
}

function ScoreBar({ score, label, icon }: { score: number; label: string; icon: React.ReactNode }) {
  const percentage = (score / 10) * 100;
  const color =
    score >= 8 ? "bg-emerald-500" : score >= 5 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-medium">
          {icon}
          {label}
        </div>
        <span className="text-muted-foreground font-mono">{score}/10</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function AICodeReviewPanel({
  code,
  language,
  question,
}: {
  code: string;
  language: string;
  question: string;
}) {
  const [review, setReview] = useState<AIReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const reviewCodeAction = useAction(api.ai.reviewCode);

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error("Write some code first before requesting an AI review");
      return;
    }

    setIsLoading(true);
    setReview(null);
    setIsOpen(true);

    try {
      const result = await reviewCodeAction({ code, language, question });
      const parsed = JSON.parse(result);
      setReview(parsed);
      toast.success("AI review complete!");
    } catch (error) {
      console.error("Failed to get AI review:", error);
      toast.error("AI review failed. Please try again.");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        onClick={handleReview}
        disabled={isLoading || !code.trim()}
        className="gap-2 bg-violet-600 hover:bg-violet-500 text-white transition-all"
        size="sm"
      >
        {isLoading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <SparklesIcon className="size-4" />
        )}
        {isLoading ? "Analyzing..." : "AI Review"}
      </Button>

      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-violet-400" />
            AI Code Review
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-2">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-violet-500/20 animate-pulse rounded-full" />
                  <SparklesIcon className="relative size-10 text-violet-400 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Analyzing your code...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI is reviewing correctness, efficiency, and code quality
                  </p>
                </div>
                <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : review ? (
              <>
                {/* Overall Score */}
                <Card className="border-violet-500/20 bg-violet-500/5">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                        <p className="text-4xl font-bold gradient-text mt-1">{review.overallScore}/10</p>
                      </div>
                      <div className="size-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                        <SparklesIcon className="size-8 text-violet-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Score Breakdown */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <ScoreBar
                      score={review.correctness.score}
                      label="Correctness"
                      icon={<CheckCircle2Icon className="size-4 text-emerald-400" />}
                    />
                    <ScoreBar
                      score={review.efficiency.score}
                      label="Efficiency"
                      icon={<ZapIcon className="size-4 text-yellow-400" />}
                    />
                    <ScoreBar
                      score={review.codeQuality.score}
                      label="Code Quality"
                      icon={<PaletteIcon className="size-4 text-blue-400" />}
                    />
                  </CardContent>
                </Card>

                {/* Detailed Feedback */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Detailed Feedback</h4>

                  <div className="rounded-xl border border-border/50 p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2Icon className="size-4 text-emerald-400" />
                      Correctness
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.correctness.feedback}</p>
                  </div>

                  <div className="rounded-xl border border-border/50 p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ZapIcon className="size-4 text-yellow-400" />
                      Efficiency
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.efficiency.feedback}</p>
                  </div>

                  <div className="rounded-xl border border-border/50 p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <PaletteIcon className="size-4 text-blue-400" />
                      Code Quality
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.codeQuality.feedback}</p>
                  </div>
                </div>

                {/* Suggestions */}
                {review.suggestions.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <LightbulbIcon className="size-4 text-yellow-400" />
                        Improvement Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2.5">
                        {review.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <span className="size-2 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Summary */}
                <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                  <p className="text-sm font-medium mb-1.5">AI Summary</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.summary}
                  </p>
                </div>

                {/* Re-review button */}
                <Button
                  onClick={handleReview}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  <SparklesIcon className="size-4" />
                  Re-analyze Code
                </Button>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
