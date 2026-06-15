"use client";

import { useEffect, useRef, useState } from "react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span ref={ref}>{count}</span>;
}

export function StatsCard({ label, value, icon, trend, color = "primary" }: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 glass p-5 transition-all duration-300 hover:border-primary/30 hover:glow-sm">
      {/* Background glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${color}/10 transition-all duration-500`} />

      <div className="relative flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight">
            <AnimatedCounter value={value} />
          </p>
          {trend && (
            <p className="text-xs text-primary font-medium">{trend}</p>
          )}
        </div>

        <div className={`size-12 rounded-xl bg-${color}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
