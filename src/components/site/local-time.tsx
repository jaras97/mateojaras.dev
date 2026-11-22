"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { overlapHours } from "@/lib/overlap";

// Ticks once a minute, aligned to the minute boundary. Cleared on unsubscribe,
// so a hidden Activity does not keep a timer running.
function subscribeEveryMinute(onChange: () => void) {
  let interval: ReturnType<typeof setInterval> | undefined;
  const timeout = setTimeout(
    () => {
      onChange();
      interval = setInterval(onChange, 60000);
    },
    60000 - (Date.now() % 60000),
  );
  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}

const getMinute = () => Math.floor(Date.now() / 60000);
const getServerMinute = () => null;

// Keeps the status line's time and overlap current after the inline script has
// set them. Renders only an inert anchor; it edits its sibling nodes.
export function LocalTime({
  template,
  timeZone,
}: {
  template: string;
  timeZone: string;
}) {
  const minute = useSyncExternalStore(
    subscribeEveryMinute,
    getMinute,
    getServerMinute,
  );
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scope = anchor.current?.parentElement;
    if (!scope || minute === null) return;
    const now = new Date(minute * 60000);
    const time = scope.querySelector("[data-status-time]");
    const overlap = scope.querySelector("[data-status-overlap]");
    if (time) {
      const hm = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(now);
      time.textContent = `${hm} ${(time.textContent ?? "").replace(/^\d{2}:\d{2}\s/, "")}`;
    }
    if (overlap) {
      const hours = overlapHours(now);
      overlap.textContent = template
        .replace("{toronto}", String(hours.toronto))
        .replace("{madrid}", String(hours.madrid));
    }
  }, [minute, template, timeZone]);

  return <span ref={anchor} hidden />;
}
