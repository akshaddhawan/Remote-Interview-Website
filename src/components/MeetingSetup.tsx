import { DeviceSettings, useCall, VideoPreview } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { CameraIcon, MicIcon, SettingsIcon, SparklesIcon } from "lucide-react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";

function MeetingSetup({ onSetupComplete }: { onSetupComplete: () => void }) {
  const [isCameraDisabled, setIsCameraDisabled] = useState(true);
  const [isMicDisabled, setIsMicDisabled] = useState(false);

  const call = useCall();

  if (!call) return null;

  useEffect(() => {
    if (isCameraDisabled) call.camera.disable();
    else call.camera.enable();
  }, [isCameraDisabled, call.camera]);

  useEffect(() => {
    if (isMicDisabled) call.microphone.disable();
    else call.microphone.enable();
  }, [isMicDisabled, call.microphone]);

  const handleJoin = async () => {
    await call.join();
    onSetupComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 dot-pattern opacity-30" />
      <div className="fixed inset-0 -z-10 mesh-gradient" />

      <div className="w-full max-w-[1200px] mx-auto animate-scale-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VIDEO PREVIEW CONTAINER */}
          <Card className="md:col-span-1 p-6 flex flex-col border-border/50 glass overflow-hidden">
            <div>
              <h1 className="text-xl font-bold mb-1">Camera Preview</h1>
              <p className="text-sm text-muted-foreground">Make sure you look good!</p>
            </div>

            {/* VIDEO PREVIEW */}
            <div className="mt-4 flex-1 min-h-[400px] rounded-xl overflow-hidden bg-muted/30 border border-border/50 relative">
              <div className="absolute inset-0">
                <VideoPreview className="h-full w-full" />
              </div>
            </div>
          </Card>

          {/* CARD CONTROLS */}
          <Card className="md:col-span-1 p-6 border-border/50 glass">
            <div className="h-full flex flex-col">
              {/* MEETING DETAILS */}
              <div>
                <h2 className="text-xl font-bold mb-1">Meeting Details</h2>
                <p className="text-sm text-muted-foreground break-all font-mono bg-muted/30 px-3 py-1.5 rounded-lg mt-2 border border-border/50">
                  {call.id}
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-5 mt-8">
                  {/* CAM CONTROL */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${!isCameraDisabled ? "bg-primary/20" : "bg-muted"}`}>
                        <CameraIcon className={`h-5 w-5 ${!isCameraDisabled ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Camera</p>
                        <p className="text-xs text-muted-foreground">
                          {isCameraDisabled ? "Off" : "On"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={!isCameraDisabled}
                      onCheckedChange={(checked) => setIsCameraDisabled(!checked)}
                    />
                  </div>

                  {/* MIC CONTROL */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${!isMicDisabled ? "bg-primary/20" : "bg-muted"}`}>
                        <MicIcon className={`h-5 w-5 ${!isMicDisabled ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Microphone</p>
                        <p className="text-xs text-muted-foreground">
                          {isMicDisabled ? "Off" : "On"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={!isMicDisabled}
                      onCheckedChange={(checked) => setIsMicDisabled(!checked)}
                    />
                  </div>

                  {/* DEVICE SETTINGS */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                        <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Settings</p>
                        <p className="text-xs text-muted-foreground">Configure devices</p>
                      </div>
                    </div>
                    <DeviceSettings />
                  </div>
                </div>

                {/* JOIN BTN */}
                <div className="space-y-3 mt-8">
                  <Button
                    className="w-full gap-2 h-12 text-base font-semibold glow-sm hover:glow-md transition-all duration-300"
                    size="lg"
                    onClick={handleJoin}
                  >
                    <SparklesIcon className="size-5" />
                    Join Meeting
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Do not worry, our team is super friendly! We want you to succeed. 🎉
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default MeetingSetup;
