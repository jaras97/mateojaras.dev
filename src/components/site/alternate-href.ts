type Href =
  | "/"
  | "/about"
  | "/contact"
  | { pathname: "/projects/[slug]"; params: { slug: string } };

// Maps the layout's selected segments to a next-intl href. Only fixed internal
// pathnames come out; nothing from the URL reaches the result except the slug,
// which getPathname encodes.
export function alternateHref(
  segments: string[],
  params: { slug?: string | string[] },
): Href {
  const [first] = segments;
  if (first === "about" && segments.length === 1) return "/about";
  if (first === "contact" && segments.length === 1) return "/contact";
  if (first === "projects" && segments.length === 2) {
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    if (slug) return { pathname: "/projects/[slug]", params: { slug } };
  }
  return "/";
}
