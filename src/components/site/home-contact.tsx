import { ArrowUpRight } from "lucide-react";
import { CopyEmail, type CopyEmailLabels } from "@/components/site/copy-email";

// Closing block of the home (CONT-05): the line, the copyable address and the
// Cal.com link. The link is omitted when no https calendar URL is stored.
export function HomeContact({
  intro,
  email,
  calendarUrl,
  calendarLabel,
  copyLabels,
}: {
  intro: string;
  email: string;
  calendarUrl: string | null;
  calendarLabel: string;
  copyLabels: CopyEmailLabels;
}) {
  return (
    <div>
      <p className="text-lg text-pretty">{intro}</p>
      {email.trim() !== "" ? (
        <div className="mt-6">
          <CopyEmail email={email} labels={copyLabels} idPrefix="home" />
        </div>
      ) : null}
      {calendarUrl?.startsWith("https://") ? (
        <p className="mt-4">
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            {calendarLabel}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </p>
      ) : null}
    </div>
  );
}
