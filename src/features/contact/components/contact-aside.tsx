import { ArrowUpRight } from "lucide-react";
import { CopyEmail, type CopyEmailLabels } from "@/components/site/copy-email";

// "Other ways to reach me" (CONT-05): the copyable address and a plain Cal.com
// link. No embed and no third-party script. The link renders only for https URLs.
export function ContactAside({
  email,
  calendarUrl,
  labels,
}: {
  email: string;
  calendarUrl: string | null;
  labels: {
    orWrite: string;
    preferCall: string;
    calendar: string;
    copy: CopyEmailLabels;
  };
}) {
  const hasCalendar = calendarUrl?.startsWith("https://") ?? false;
  return (
    <aside className="mt-12 lg:col-span-3 lg:col-start-10 lg:mt-12">
      <p className="mb-2 font-mono text-sm text-muted-foreground">
        {labels.orWrite}
      </p>
      <CopyEmail email={email} labels={labels.copy} idPrefix="contact-aside" />
      {hasCalendar ? (
        <div className="mt-6">
          <p className="mb-2 font-mono text-sm text-muted-foreground">
            {labels.preferCall}
          </p>
          <a
            href={calendarUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            {labels.calendar}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      ) : null}
    </aside>
  );
}
