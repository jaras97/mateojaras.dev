import type { ReactNode } from "react";
import { PlainText } from "@/components/site/case-study/plain-text";
import { SectionMarginNumber } from "@/components/site/case-study/section-margin-number";
import { PageSection } from "@/components/site/page-section";
import type { Locale } from "@/features/site-settings/types";
import { localized } from "@/lib/i18n-fields";
import { docHasText, RichText } from "@/lib/rich-text";

export type CaseSectionsProject = {
  problemEn: string | null;
  problemEs: string | null;
  roleEn: string | null;
  roleEs: string | null;
  solutionEn: string | null;
  solutionEs: string | null;
  caseStudyEn: unknown;
  caseStudyEs: unknown;
  resultsEn: string[] | null;
  resultsEs: string[] | null;
  techDecisionsEn: { decisions: { title: string; body: string }[] } | null;
  techDecisionsEs: { decisions: { title: string; body: string }[] } | null;
};

export type CaseSectionLabels = {
  problem: string;
  role: string;
  solution: string;
  results: string;
  decisions: string;
};

const hasText = (value: string | null | undefined) =>
  Boolean(value && value.trim() !== "");

// Sections keep fixed numbers (01..05): one without data is skipped and the
// numbers do not shift (CASE-02).
export function CaseSections({
  project,
  locale,
  slug,
  labels,
  solutionExtra,
  decisionsAside,
}: {
  project: CaseSectionsProject;
  locale: Locale;
  slug: string;
  labels: CaseSectionLabels;
  solutionExtra?: ReactNode;
  decisionsAside?: ReactNode;
}) {
  const problem = localized(project, "problem", locale) as string | null;
  const role = localized(project, "role", locale) as string | null;
  const solution = localized(project, "solution", locale) as string | null;
  const caseStudy = localized(project, "caseStudy", locale);
  const results = (
    (localized(project, "results", locale) as string[] | null) ?? []
  ).filter(hasText);
  const decisions = (
    localized(project, "techDecisions", locale) as {
      decisions: { title: string; body: string }[];
    } | null
  )?.decisions.filter((d) => hasText(d.title) || hasText(d.body));
  const extra = solutionExtra ?? null;

  return (
    <>
      {hasText(problem) ? (
        <PageSection
          id={`${slug}-problem`}
          number="01"
          marginNumber={<SectionMarginNumber number="01" />}
          scene
          title={labels.problem}
        >
          <PlainText text={problem} />
        </PageSection>
      ) : null}
      {hasText(role) ? (
        <PageSection
          id={`${slug}-role`}
          number="02"
          marginNumber={<SectionMarginNumber number="02" />}
          scene
          title={labels.role}
        >
          <PlainText text={role} />
        </PageSection>
      ) : null}
      {hasText(solution) || docHasText(caseStudy) || extra !== null ? (
        <PageSection
          id={`${slug}-solution`}
          number="03"
          marginNumber={<SectionMarginNumber number="03" />}
          scene
          title={labels.solution}
        >
          <PlainText text={solution} />
          {docHasText(caseStudy) ? (
            <div className="prose-site mt-8">
              <RichText doc={caseStudy} />
            </div>
          ) : null}
          {extra !== null ? <div className="mt-8">{extra}</div> : null}
        </PageSection>
      ) : null}
      {results.length > 0 ? (
        <PageSection
          id={`${slug}-results`}
          number="04"
          marginNumber={<SectionMarginNumber number="04" />}
          scene
          title={labels.results}
        >
          <ul className="flex list-disc flex-col gap-2 ps-4">
            {results.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
        </PageSection>
      ) : null}
      {decisions && decisions.length > 0 ? (
        <PageSection
          id={`${slug}-decisions`}
          number="05"
          marginNumber={<SectionMarginNumber number="05" />}
          scene
          title={labels.decisions}
          aside={decisionsAside}
        >
          <div className="flex flex-col gap-8">
            {decisions.map((decision) => (
              <div key={decision.title}>
                <h3 className="font-semibold">{decision.title}</h3>
                <div className="mt-2">
                  <PlainText text={decision.body} />
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      ) : null}
    </>
  );
}
