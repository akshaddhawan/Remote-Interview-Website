"use client";

import { QuickActionType } from "@/constants";
import { Card } from "./ui/card";
import { useRef } from "react";

function ActionCard({ action, onClick }: { action: QuickActionType; onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <Card
      ref={cardRef}
      className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer glass"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease" }}
    >
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-100 group-hover:opacity-60 transition-opacity duration-500`}
      />

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />

      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/5 to-transparent" />

      {/* Content */}
      <div className="relative p-6 size-full">
        <div className="space-y-4">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${action.color}/10 group-hover:bg-${action.color}/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-1 ring-${action.color}/20`}
          >
            <action.icon className={`h-7 w-7 text-${action.color}`} />
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ActionCard;
