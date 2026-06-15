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
  XIcon,
} from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

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
      <div className="h-2 rounded-full bg-muted overflow-hidden">
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
    if (!code.trim()) return;

    setIsLoading(true);
    setIsOpen(true);

    try {
      const result = await reviewCodeAction({ code, language, question });
      const parsed = JSON.parse(result);
      setReview(parsed);
    } catch (error) {
      console.error("Failed to get AI review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleReview}
        disabled={isLoading || !code.trim()}
        className="gap-2 glow-sm hover:glow-md transition-all"
        size="sm"
      >
        <SparklesIcon className="size-4" />
        AI Review
      </Button>
    );
  }

  return (
    <div className="border-l border-border/50 glass-heavy h-full flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-5 text-primary" />
          <h3 className="font-semibold">AI Code Review</h3>
        </div>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsOpen(false)}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="relative">
                <SparklesIcon className="size-8 text-primary animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">Analyzing your code...</p>
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : review ? (
            <>
              {/* Overall Score */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                      <p className="text-3xl font-bold gradient-text">{review.overallScore}/10</p>
                    </div>
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <SparklesIcon className="size-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                <div className="rounded-xl border border-border/50 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <CheckCircle2Icon className="size-3.5 text-emerald-400" />
                    Correctness
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.correctness.feedback}</p>
                </div>

                <div className="rounded-xl border border-border/50 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <ZapIcon className="size-3.5 text-yellow-400" />
                    Efficiency
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.efficiency.feedback}</p>
                </div>

                <div className="rounded-xl border border-border/50 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <PaletteIcon className="size-3.5 text-blue-400" />
                    Code Quality
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.codeQuality.feedback}</p>
                </div>
              </div>

              {/* Suggestions */}
              {review.suggestions.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <LightbulbIcon className="size-4 text-yellow-400" />
                      Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {review.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  &ldquo;{review.summary}&rdquo;
                </p>
              </div>

              {/* Re-review button */}
              <Button onClick={handleReview} variant="outline" size="sm" className="w-full gap-2">
                <SparklesIcon className="size-3.5" />
                Re-analyze
              </Button>
            </>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}
