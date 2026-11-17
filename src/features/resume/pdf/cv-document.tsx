"use no memo";

import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { CvData } from "../cv-data";

// A4, one column, no photo, no accent. Static TTF families are registered by
// registerCvFonts() before rendering. Pure components, no hooks.
const INK = "#171f2e";
const INK_2 = "#575e69";
const LINE = "#dbd7d0";

const styles = StyleSheet.create({
  page: {
    paddingTop: 51,
    paddingBottom: 51,
    paddingHorizontal: 57,
    fontFamily: "Hanken Grotesk",
    fontWeight: 400,
    fontSize: 9.5,
    lineHeight: 1.4,
    color: INK,
  },
  name: {
    fontFamily: "Funnel Display",
    fontWeight: 700,
    fontSize: 20,
    lineHeight: 1.1,
  },
  headline: { marginTop: 3, fontSize: 9.5 },
  meta: {
    fontFamily: "Geist Mono",
    fontWeight: 400,
    fontSize: 8.5,
    color: INK_2,
  },
  contact: { marginTop: 6, flexDirection: "row", flexWrap: "wrap" },
  link: { color: INK_2, textDecoration: "none" },
  section: { marginTop: 14 },
  heading: {
    fontFamily: "Funnel Display",
    fontWeight: 700,
    fontSize: 11,
    lineHeight: 1.2,
    paddingBottom: 3,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    borderBottomStyle: "solid",
  },
  item: { marginBottom: 7 },
  itemHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  bold: { fontWeight: 700 },
  bullet: { flexDirection: "row", marginTop: 1.5, paddingLeft: 4 },
  bulletMark: { width: 9 },
  bulletText: { flex: 1 },
  skillRow: { flexDirection: "row", marginBottom: 2 },
  skillCategory: { width: 78, fontWeight: 700 },
  skillNames: { flex: 1 },
});

function bare(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function Heading({ children }: { children: string }) {
  return (
    <Text style={styles.heading} minPresenceAhead={40}>
      {children}
    </Text>
  );
}

export function CvDocument({ data }: { data: CvData }) {
  const { contact, labels } = data;
  const contactItems: { text: string; href?: string }[] = [
    { text: contact.email, href: `mailto:${contact.email}` },
    { text: `${contact.location}, ${contact.utcOffset}` },
    ...(contact.githubUrl
      ? [{ text: bare(contact.githubUrl), href: contact.githubUrl }]
      : []),
    ...(contact.linkedinUrl
      ? [{ text: bare(contact.linkedinUrl), href: contact.linkedinUrl }]
      : []),
    ...(contact.siteUrl
      ? [{ text: bare(contact.siteUrl), href: contact.siteUrl }]
      : []),
  ];

  return (
    <Document
      title={`${data.name} CV`}
      author={data.name}
      language={data.locale}
    >
      <Page size="A4" style={styles.page} wrap>
        <View>
          <Text style={styles.name}>{data.name}</Text>
          {data.headline ? (
            <Text style={styles.headline}>{data.headline}</Text>
          ) : null}
          <View style={styles.contact}>
            {contactItems.map((item, index) => (
              <Text key={item.text} style={styles.meta}>
                {index > 0 ? "  ·  " : ""}
                {item.href ? (
                  <Link src={item.href} style={styles.link}>
                    {item.text}
                  </Link>
                ) : (
                  item.text
                )}
              </Text>
            ))}
          </View>
        </View>

        {data.summary ? (
          <View style={styles.section}>
            <Heading>{labels.summary}</Heading>
            <Text>{data.summary}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View style={styles.section}>
            <Heading>{labels.experience}</Heading>
            {data.experience.map((job) => (
              <View
                key={`${job.company}-${job.dates}`}
                style={styles.item}
                wrap={false}
              >
                <View style={styles.itemHead}>
                  <Text style={styles.bold}>
                    {job.role}, {job.company}
                  </Text>
                  <Text style={styles.meta}>{job.dates}</Text>
                </View>
                {job.location ? (
                  <Text style={styles.meta}>{job.location}</Text>
                ) : null}
                {job.bullets.map((bullet) => (
                  <View key={bullet} style={styles.bullet}>
                    <Text style={styles.bulletMark}>-</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {data.projects.length > 0 ? (
          <View style={styles.section}>
            <Heading>{labels.projects}</Heading>
            {data.projects.map((project) => (
              <View key={project.title} style={styles.item} wrap={false}>
                <View style={styles.itemHead}>
                  <Text style={styles.bold}>{project.title}</Text>
                  {project.liveUrl ? (
                    <Text style={styles.meta}>
                      <Link src={project.liveUrl} style={styles.link}>
                        {bare(project.liveUrl)}
                      </Link>
                    </Text>
                  ) : null}
                </View>
                {project.tagline ? <Text>{project.tagline}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.skills.length > 0 ? (
          <View style={styles.section}>
            <Heading>{labels.skills}</Heading>
            {data.skills.map((group) => (
              <View key={group.category} style={styles.skillRow} wrap={false}>
                <Text style={styles.skillCategory}>{group.category}</Text>
                <Text style={styles.skillNames}>{group.names.join(", ")}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.education.length > 0 ? (
          <View style={styles.section}>
            <Heading>{labels.education}</Heading>
            {data.education.map((row) => (
              <View
                key={`${row.institution}-${row.program}`}
                style={styles.item}
                wrap={false}
              >
                <View style={styles.itemHead}>
                  <Text style={styles.bold}>
                    {row.program}, {row.institution}
                  </Text>
                  <Text style={styles.meta}>{row.dates}</Text>
                </View>
                {row.status ? <Text>{row.status}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.languages.length > 0 ? (
          <View style={styles.section}>
            <Heading>{labels.languages}</Heading>
            <Text>
              {data.languages
                .map((entry) => `${entry.name} (${entry.level})`)
                .join("  ·  ")}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
