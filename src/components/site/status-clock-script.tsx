import { InlineScript } from "@/components/site/inline-script";
import { overlapHours } from "@/lib/overlap";

// Escapes stored data for a script body: JSON, plus "<" so a stored
// "</script>" can never close the tag (T-04-21).
function literal(value: string): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

// Writes the local time and the overlap hours into the status line before
// paint on a hard load. The prerendered shell holds only "UTC-5" and the static
// phrase, so nothing here reads the clock on the server (SITE-03).
export function StatusClockScript({
  template,
  timeZone,
}: {
  template: string;
  timeZone: string;
}) {
  const html = `(function(){try{var f=${String(overlapHours)};var s=document.currentScript;var p=s&&s.parentElement;if(!p)return;var tz=${literal(timeZone)};var tpl=${literal(template)};var t=p.querySelector("[data-status-time]");var o=p.querySelector("[data-status-overlap]");var now=new Date();if(t){var hm=new Intl.DateTimeFormat("en-GB",{timeZone:tz,hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(now);t.textContent=hm+" "+t.textContent.replace(/^\\d{2}:\\d{2}\\s/,"")}if(o){var h=f(now);o.textContent=tpl.replace("{toronto}",String(h.toronto)).replace("{madrid}",String(h.madrid))}}catch(e){}})()`;
  return <InlineScript html={html} />;
}
