import { CODING_QUESTIONS, LANGUAGES } from "@/constants";
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  AlertCircleIcon,
  BookIcon,
  CheckCircle2Icon,
  LightbulbIcon,
  Loader2Icon,
  SendIcon,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import AICodeReviewPanel from "./AICodeReviewPanel";
import { Button } from "./ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import toast from "react-hot-toast";
import { Badge } from "./ui/badge";
import { format } from "date-fns";

function CodeEditor({ interviewId }: { interviewId?: string }) {
  const [selectedQuestion, setSelectedQuestion] = useState(CODING_QUESTIONS[0]);
  const [language, setLanguage] = useState<"javascript" | "python" | "java">(LANGUAGES[0].id);
  const [code, setCode] = useState(selectedQuestion.starterCode[language]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitCode = useMutation(api.codeSubmissions.submitCode);
  const submissions = useQuery(api.codeSubmissions.getSubmissions, {
    interviewId: interviewId,
  });

  const handleQuestionChange = (questionId: string) => {
    const question = CODING_QUESTIONS.find((q) => q.id === questionId)!;
    setSelectedQuestion(question);
    setCode(question.starterCode[language]);
  };

  const handleLanguageChange = (newLanguage: "javascript" | "python" | "java") => {
    setLanguage(newLanguage);
    setCode(selectedQuestion.starterCode[newLanguage]);
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCode({
        interviewId: interviewId,
        code,
        language,
        question: selectedQuestion.title,
      });
      toast.success("Code submitted successfully!");
    } catch (error) {
      console.error("Failed to submit code:", error);
      toast.error("Failed to submit code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResizablePanelGroup direction="vertical" className="min-h-[calc-100vh-4rem-1px]">
      {/* QUESTION SECTION */}
      <ResizablePanel>
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                      {selectedQuestion.title}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose your language and solve the problem
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Select value={selectedQuestion.id} onValueChange={handleQuestionChange}>
                    <SelectTrigger className="w-[180px] border-border/50">
                      <SelectValue placeholder="Select question" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODING_QUESTIONS.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[150px] border-border/50">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <img
                            src={`/${language}.png`}
                            alt={language}
                            className="w-5 h-5 object-contain"
                          />
                          {LANGUAGES.find((l) => l.id === language)?.name}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          <div className="flex items-center gap-2">
                            <img
                              src={`/${lang.id}.png`}
                              alt={lang.name}
                              className="w-5 h-5 object-contain"
                            />
                            {lang.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* AI Review */}
                  <AICodeReviewPanel
                    code={code}
                    language={language}
                    question={selectedQuestion.title}
                  />

                  {/* Submit Code Button */}
                  <Button
                    onClick={handleSubmitCode}
                    disabled={isSubmitting || !code.trim()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white glow-sm hover:glow-md transition-all"
                    size="sm"
                  >
                    {isSubmitting ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <SendIcon className="size-4" />
                    )}
                    Submit Code
                  </Button>
                </div>
              </div>

              {/* PREVIOUS SUBMISSIONS */}
              {submissions && submissions.length > 0 && (
                <Card className="border-border/50 glass border-l-4 border-l-emerald-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2Icon className="size-4 text-emerald-400" />
                        Submitted Solutions
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {submissions.map((sub, index) => (
                        <div
                          key={sub._id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/30 text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                              {submissions.length - index}
                            </span>
                            <div>
                              <span className="font-medium">{sub.question}</span>
                              <span className="text-muted-foreground ml-2">• {sub.language}</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(sub._creationTime, "h:mm a")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PROBLEM DESC. */}
              <Card className="border-border/50 glass">
                <CardHeader className="flex flex-row items-center gap-2">
                  <BookIcon className="h-5 w-5 text-primary/80" />
                  <CardTitle>Problem Description</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line">{selectedQuestion.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* PROBLEM EXAMPLES */}
              <Card className="border-border/50 glass">
                <CardHeader className="flex flex-row items-center gap-2">
                  <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-full w-full rounded-lg border border-border/50">
                    <div className="p-4 space-y-4">
                      {selectedQuestion.examples.map((example, index) => (
                        <div key={index} className="space-y-2">
                          <p className="font-medium text-sm">Example {index + 1}:</p>
                          <ScrollArea className="h-full w-full rounded-md">
                            <pre className="bg-muted/30 p-3 rounded-lg text-sm font-mono border border-border/30">
                              <div>Input: {example.input}</div>
                              <div>Output: {example.output}</div>
                              {example.explanation && (
                                <div className="pt-2 text-muted-foreground">
                                  Explanation: {example.explanation}
                                </div>
                              )}
                            </pre>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                    <ScrollBar />
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* CONSTRAINTS */}
              {selectedQuestion.constraints && (
                <Card className="border-border/50 glass">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                    <CardTitle>Constraints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1.5 text-sm marker:text-muted-foreground">
                      {selectedQuestion.constraints.map((constraint, index) => (
                        <li key={index} className="text-muted-foreground">
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* CODE EDITOR */}
      <ResizablePanel defaultSize={60} maxSize={100}>
        <div className="h-full relative">
          <Editor
            height={"100%"}
            defaultLanguage={language}
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              wordWrap: "on",
              wrappingIndent: "indent",
              fontFamily: "'JetBrains Mono', monospace",
              fontLigatures: true,
              renderLineHighlight: "all",
              cursorBlinking: "smooth",
              smoothScrolling: true,
            }}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
export default CodeEditor;
