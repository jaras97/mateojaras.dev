import { renderToBuffer } from "@react-pdf/renderer";
import { extractText, getDocumentProxy } from "unpdf";
import { describe, expect, it } from "vitest";
import { cvFixture } from "../cv-fixture";
import { CvDocument } from "./cv-document";
import { registerCvFonts } from "./fonts";

async function extract(buffer: Uint8Array) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return {
    totalPages,
    text: text.normalize("NFC").replace(/\s+/g, " "),
  };
}

const ACCENTED = ["á", "é", "í", "ó", "ú", "ñ"];

describe("CvDocument", () => {
  for (const locale of ["en", "es"] as const) {
    it(`renders the ${locale} fixture in at most 2 A4 pages with intact accents`, async () => {
      registerCvFonts();
      const data = cvFixture(locale);
      const buffer = await renderToBuffer(<CvDocument data={data} />);
      expect(Buffer.from(buffer).subarray(0, 5).toString()).toBe("%PDF-");
      const { totalPages, text } = await extract(buffer);
      expect(totalPages).toBeLessThanOrEqual(2);
      expect(text).toContain("Medellín");
      // Every accented letter the fixture contains must survive extraction.
      const source = JSON.stringify(data).normalize("NFC");
      const expected = ACCENTED.filter((ch) => source.includes(ch));
      expect(expected.length).toBeGreaterThan(0);
      for (const ch of expected) expect(text).toContain(ch);
      expect(text).toContain(data.labels.experience);
      expect(text).toContain(data.labels.education);
    });
  }

  it("keeps á é í ó ú ñ in the text layer of all three registered families", async () => {
    registerCvFonts();
    const { Document, Page, Text } = await import("@react-pdf/renderer");
    const probe = "áéíóúñ";
    const doc = (
      <Document>
        <Page size="A4">
          <Text style={{ fontFamily: "Funnel Display", fontWeight: 700 }}>
            {probe}
          </Text>
          <Text style={{ fontFamily: "Hanken Grotesk", fontWeight: 400 }}>
            {probe}
          </Text>
          <Text style={{ fontFamily: "Hanken Grotesk", fontWeight: 700 }}>
            {probe}
          </Text>
          <Text style={{ fontFamily: "Geist Mono", fontWeight: 400 }}>
            {probe}
          </Text>
        </Page>
      </Document>
    );
    const { text } = await extract(await renderToBuffer(doc));
    expect(text.split(probe).length - 1).toBe(4);
  });
});
