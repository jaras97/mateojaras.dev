#!/usr/bin/env bash
# Phase 1 gate (01-12). Checks every mechanical gate of phase 1 and owns, once,
# every reading rule the phase close depends on. Nothing here takes an
# approval, clearance, review, permission or policy argument: every option,
# clearance, review statement, deferral and Lectura value is read from Teo's
# verbatim blocks in .planning/phases/01-identidad-y-contenido/*-ANSWERS.md.
#
# Usage:
#   bash scripts/check-phase-1.sh --pre-approval | --final
#   bash scripts/check-phase-1.sh --pii | --review | --permission
#   bash scripts/check-phase-1.sh --parse-g1 1|2        (reply text on stdin)
#   bash scripts/check-phase-1.sh --parse-g7            (reply text on stdin)
#   bash scripts/check-phase-1.sh --parse-clearance PATH (reply text on stdin)
#   bash scripts/check-phase-1.sh --parse-reviewed      (reply text on stdin)
#   bash scripts/check-phase-1.sh --parse-deferral TARGET (reply text on stdin)
#   bash scripts/check-phase-1.sh --parse-permission    (docs/content file on stdin)
#
# Gate lines: "PASS name", "FAIL name: reason", "SKIP name (reason)" and
# "DEFER name: what (aplazado por Teo en G7)". A DEFER line is never a pass: it
# names something Teo, in his own G7 words ("aplazar: <objetivo>"), chose to
# leave for the admin. Summary: "phase 1 gate: N passed, M failed, K skipped,
# D deferred"; exit 1 when M > 0.
#
# PyYAML, fontTools and Pillow are local read-only tools called through
# python3 -I, never project dependencies (01-10-SUMMARY.md "Herramientas
# locales"). This script runs outside pnpm check.

set -uo pipefail

usage() {
  cat >&2 <<'USAGE'
usage: bash scripts/check-phase-1.sh MODE
  --pre-approval | --final              run the phase 1 gates
  --pii | --review | --permission       clearance, review and permission reports
  --parse-g1 N   (N = 1 or 2)           G1 item N from a reply on stdin
  --parse-g7                            G7 option from a reply on stdin
  --parse-clearance PATH                liberar|quitar|pendiente for PATH from a reply on stdin
  --parse-reviewed                      todas|pendiente from a reply on stdin
  --parse-deferral TARGET               aplazar|pendiente for TARGET from a reply on stdin
  --parse-permission                    con-permiso|sin-permiso from a docs/content file on stdin
No mode takes an approval, clearance, review, permission or policy value.
USAGE
  exit 2
}

MODE="${1:-}"
case "$MODE" in
  --pre-approval|--final|--pii|--review|--permission|--parse-g7|--parse-reviewed|--parse-permission)
    [ "$#" -eq 1 ] || usage ;;
  --parse-g1)
    [ "$#" -eq 2 ] || usage
    case "$2" in 1|2) ;; *) usage ;; esac ;;
  --parse-clearance|--parse-deferral)
    [ "$#" -eq 2 ] || usage
    [ -n "$2" ] || usage ;;
  *) usage ;;
esac

ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || { echo "check-phase-1: not inside a git checkout" >&2; exit 2; }
cd "$ROOT" || exit 2

IFS= read -r -d '' PY <<'PYEOF'
import os, re, subprocess, sys

PHASE = ".planning/phases/01-identidad-y-contenido"
ANS03 = PHASE + "/01-03-ANSWERS.md"
ANS09 = PHASE + "/01-09-ANSWERS.md"
SUM10 = PHASE + "/01-10-SUMMARY.md"
ANS12 = PHASE + "/01-12-ANSWERS.md"
G1_HEAD = "Respuestas de Teo (G1)"
LEG_HEAD = "Respuestas de Teo (legitimidad de @axe-core/playwright)"
G3_HEAD = "Respuestas de Teo (G3)"
G7_HEAD = "Respuestas de Teo (G7)"
PII_HEAD = "Posibles datos personales"
WEBP = re.compile(r"^[0-9]{2}-[^/\s]+\.webp$")
FECHA = re.compile(r"^\s*Fecha\s*:", re.I)

# ---------- text helpers ----------

def read(path):
    try:
        with open(path, encoding="utf-8") as fh:
            return fh.read()
    except (FileNotFoundError, IsADirectoryError):
        return None

def block(text, heading):
    """Lines under '## heading' up to the next '## ' line; None if absent."""
    if text is None:
        return None
    out, inside = [], False
    for line in text.splitlines():
        if line.startswith("## "):
            if inside:
                break
            if line[3:].strip() == heading:
                inside = True
            continue
        if inside:
            out.append(line)
    return "\n".join(out) if inside else None

def without_fecha(text):
    return "\n".join(l for l in (text or "").splitlines() if not FECHA.match(l))

def messages(text):
    """Dated messages: lines after each 'Fecha:' line; lines before the first one are one message."""
    msgs = [[]]
    for line in (text or "").splitlines():
        if FECHA.match(line):
            msgs.append([])
        else:
            msgs[-1].append(line)
    return msgs

def latest_values(text, extract):
    """Distinct values from the latest dated message where extract() finds any."""
    for msg in reversed(messages(text)):
        vals = set()
        for line in msg:
            v = extract(line)
            if v is not None:
                vals.add(v)
        if vals:
            return vals
    return set()

def norm_path(p):
    p = p.strip()
    p = p.strip("`\"'“”‘’").strip()
    if p.startswith("./"):
        p = p[2:]
    return p

# ---------- reading rules ----------

G1_VALUES = {"sí": "sí", "si": "sí", "no": "no"}

def parse_g1(text, n):
    rx = re.compile(r"(?<![0-9])" + str(n) + r"[ \t]*[.:)=\-]?[ \t]*\(?(sí|si|no)\)?(?![^\W_])", re.I)
    vals = {G1_VALUES[m.group(1).lower()] for m in rx.finditer(without_fecha(text))}
    return vals.pop() if len(vals) == 1 else "pendiente"

def parse_legitimacy(text):
    body = without_fecha(text).strip()
    low = body.lower()
    m = re.match(r"(\S+)", body)
    first = m.group(1).lower().strip(".,;:!?¡¿\"'()`") if m else ""
    if first == "verificado" and "rechaz" not in low:
        return "verificado"
    if low.startswith("no aplica"):
        return "no aplica"
    if low.startswith("rechaz"):
        return "rechazado"
    return "pendiente"

def parse_g3(text):
    rx = re.compile(r"variante[ \t]*:?[ \t]*\(?([abc])\)?(?![^\W_])", re.I)
    vals = {m.group(1).lower() for m in rx.finditer(without_fecha(text))}
    return vals.pop() if len(vals) == 1 else "pendiente"

G7_RX = re.compile(r"^\s*opci[oó]n\s*:\s*(no-aprobar|aprobar-con-cambios|aprobar)\.?\s*$", re.I)

def parse_g7(text):
    def ex(line):
        m = G7_RX.match(line)
        return m.group(1).lower() if m else None
    vals = latest_values(text, ex)
    return vals.pop() if len(vals) == 1 else "pendiente"

CLR_RX = re.compile(r"^\s*(liberar|quitar)\s*:\s*(.+?)\s*$", re.I)

def parse_clearance(text, path):
    want = norm_path(path)
    def ex(line):
        m = CLR_RX.match(line)
        if not m:
            return None
        got = norm_path(m.group(2))
        if re.search(r"\s", got) or got != want:
            return None
        return m.group(1).lower()
    vals = latest_values(text, ex)
    return vals.pop() if len(vals) == 1 else "pendiente"

REV_RX = re.compile(r"^\s*revisadas?\s*:\s*([^\s.]+)\.?\s*$", re.I)

def parse_reviewed(text):
    def ex(line):
        m = REV_RX.match(line)
        return m.group(1).lower() if m else None
    vals = latest_values(text, ex)
    return "todas" if vals == {"todas"} else "pendiente"

DEF_RX = re.compile(r"^\s*aplazar\s*:\s*(.+?)\s*$", re.I)

def norm_target(t):
    t = norm_path(t.strip().rstrip("."))
    return t.rstrip(".").rstrip("/").lower()

def parse_deferral(text, target):
    want = norm_target(target)
    def ex(line):
        m = DEF_RX.match(line)
        if not m:
            return None
        got = norm_target(m.group(1))
        return "aplazar" if got == want and not re.search(r"\s", got) else None
    return "aplazar" if latest_values(text, ex) else "pendiente"

def front_matter(text):
    """(dict, ok). ok False when there is no front-matter or it does not parse."""
    import yaml
    if text is None:
        return {}, False
    lines = text.splitlines()
    idx = [i for i, l in enumerate(lines) if l.strip() == "---"]
    if len(idx) < 2:
        return {}, False
    try:
        data = yaml.safe_load("\n".join(lines[idx[0] + 1:idx[1]]))
    except yaml.YAMLError:
        return {}, False
    if not isinstance(data, dict):
        return {}, False
    return data, True

def pending_list(fm):
    pf = fm.get("pendingFields")
    if pf is None:
        return []
    if isinstance(pf, str):
        return [pf]
    if isinstance(pf, list):
        return [str(x) for x in pf]
    return None  # malformed

def parse_permission(text):
    fm, ok = front_matter(text)
    if not ok:
        return "sin-permiso"
    pf = pending_list(fm)
    if pf is None or "clientPermission" in pf:
        return "sin-permiso"
    return "con-permiso" if fm.get("clientPermission") is True else "sin-permiso"

# ---------- repository state ----------

def g7_text():
    return block(read(ANS12), G7_HEAD) or ""

def projects():
    """[(slug, front-matter, ok, path)] for docs/content/*.md without README.md."""
    out = []
    for name in sorted(os.listdir("docs/content")):
        if not name.endswith(".md") or name == "README.md":
            continue
        path = "docs/content/" + name
        fm, ok = front_matter(read(path))
        out.append((name[:-3], fm, ok, path))
    return out

def main_root():
    common = subprocess.run(["git", "rev-parse", "--path-format=absolute", "--git-common-dir"],
                            capture_output=True, text=True, check=True).stdout.strip()
    return os.path.dirname(common)

def disk_webps(slug=None):
    """Relative paths material/<slug>/NN-*.webp in the main checkout."""
    base = os.path.join(main_root(), "material")
    out = []
    if not os.path.isdir(base):
        return out
    slugs = [slug] if slug else sorted(os.listdir(base))
    for s in slugs:
        d = os.path.join(base, s)
        if not os.path.isdir(d):
            continue
        for f in sorted(os.listdir(d)):
            if WEBP.match(f):
                out.append("material/%s/%s" % (s, f))
    return out

def main_path(rel):
    return os.path.join(main_root(), rel)

def size_of(abs_path):
    from PIL import Image
    try:
        with Image.open(abs_path) as im:
            return im.size
    except Exception:
        return None

def tracked_material():
    r = subprocess.run(["git", "ls-files", "material"], capture_output=True, text=True, check=True)
    return [l for l in r.stdout.splitlines() if l]

def pii_list():
    """(paths, error). error is a string when the list is malformed or missing."""
    sec = block(read(SUM10), PII_HEAD)
    if sec is None:
        return [], "falta la sección '## %s' en 01-10-SUMMARY.md" % PII_HEAD
    rx = re.compile(r"^- (material/[a-z0-9-]+/[0-9]{2}-[^/\s|]+\.webp) \| \S.*$")
    lines = [l for l in sec.splitlines() if l.strip()]
    if lines == ["- ninguno"]:
        return [], None
    paths = []
    for l in lines:
        m = rx.match(l)
        if not m:
            return [], "línea mal formada en la lista de datos personales: %r" % l
        paths.append(m.group(1))
    if not paths:
        return [], "lista de datos personales vacía (debe decir '- ninguno')"
    return paths, None

def review_state(text, path):
    c = parse_clearance(text, path)
    if c == "quitar":
        return "quitar"
    if c == "liberar" or parse_reviewed(text) == "todas":
        return "revisada"
    return "pendiente"

def deferred(text, target):
    return parse_deferral(text, target) == "aplazar"

# ---------- gates ----------
# Each gate returns a list of (status, detail). status in PASS FAIL SKIP DEFER.

DEF_NOTE = "aplazado por Teo en G7"

def gate_g1_record(mode):
    txt = read(ANS03)
    if txt is None:
        return [("FAIL", "falta 01-03-ANSWERS.md")]
    teo = block(txt, G1_HEAD)
    lect = block(txt, "Lectura de G1")
    if teo is None or lect is None:
        return [("FAIL", "falta '## %s' o '## Lectura de G1'" % G1_HEAD)]
    want = {"yaml": parse_g1(teo, 1), "axe": parse_g1(teo, 2)}
    found = {"yaml": [], "axe": []}
    out = []
    for l in (x.strip() for x in lect.splitlines()):
        if not l:
            continue
        m = re.match(r"^(yaml|axe)\s*:\s*(.+)$", l, re.I)
        if m:
            found[m.group(1).lower()].append(m.group(2).strip())
        elif re.match(r"^(material|m[eé]tricas)\b", l, re.I):
            out.append(("FAIL", "la Lectura de G1 tiene una línea que G1 no pregunta: %r" % l))
    for k in ("yaml", "axe"):
        if len(found[k]) != 1:
            out.append(("FAIL", "la Lectura de G1 debe tener exactamente una línea %s (tiene %d)" % (k, len(found[k]))))
        elif found[k][0] != want[k]:
            out.append(("FAIL", "Lectura %s: %s, pero las palabras de Teo dan %s" % (k, found[k][0], want[k])))
    return out or [("PASS", "")]

def gate_legitimacy_record(mode):
    txt = read(ANS03)
    teo = block(txt, LEG_HEAD)
    lect = block(txt, "Lectura de legitimidad")
    if teo is None or lect is None:
        return [("FAIL", "falta el bloque de legitimidad o su Lectura en 01-03-ANSWERS.md")]
    want = parse_legitimacy(teo)
    got = [m.group(1).strip() for m in re.finditer(r"^\s*axe-legitimidad\s*:\s*(.+)$", lect, re.M)]
    if len(got) != 1:
        return [("FAIL", "debe haber exactamente una línea axe-legitimidad (hay %d)" % len(got))]
    if got[0] != want:
        return [("FAIL", "Lectura axe-legitimidad: %s, pero las palabras de Teo dan %s" % (got[0], want))]
    return [("PASS", "")]

def pending_or_defer(mode, g7, target, what, pending_known):
    """A shortfall Teo can resolve at G7: DEFER if he deferred target, SKIP under
    --pre-approval when the field is listed as pending, FAIL otherwise."""
    if deferred(g7, target):
        return ("DEFER", "%s (%s: 'aplazar: %s')" % (what, DEF_NOTE, target))
    if mode == "pre" and pending_known:
        return ("SKIP", what)
    return ("FAIL", what)

def finish(results, skip_label="pending G7"):
    """Collapse SKIP entries into one line; keep FAIL and DEFER lines."""
    fails = [r for r in results if r[0] == "FAIL"]
    skips = [r[1] for r in results if r[0] == "SKIP"]
    defers = [r for r in results if r[0] == "DEFER"]
    out = list(fails)
    if skips:
        out.append(("SKIP", "%s: %s" % (skip_label, "; ".join(skips))))
    out.extend(defers)
    return out or [("PASS", "")]

def gate_content_media(mode):
    g7, res = g7_text(), []
    for slug, fm, ok, _ in projects():
        if not ok:
            res.append(("FAIL", "%s: front-matter ilegible" % slug)); continue
        media = fm.get("media") or []
        if not isinstance(media, list) or len(media) < 3:
            n = len(media) if isinstance(media, list) else 0
            pf = pending_list(fm) or []
            res.append(pending_or_defer(mode, g7, "material/" + slug,
                                        "%s: %d de 3 entradas en media" % (slug, n), "media" in pf))
    return finish(res)

def gate_metric_sources(mode):
    out = []
    for slug, fm, ok, _ in projects():
        if not ok:
            out.append(("FAIL", "%s: front-matter ilegible" % slug)); continue
        metrics = fm.get("metrics")
        if metrics is None:
            metrics = []
        if not isinstance(metrics, list):
            out.append(("FAIL", "%s: metrics no es una lista" % slug)); continue
        for i, m in enumerate(metrics, 1):
            for field in ("labelEs", "labelEn", "value", "sourceEs", "sourceEn"):
                v = m.get(field) if isinstance(m, dict) else None
                if not isinstance(v, str) or not v.strip():
                    out.append(("FAIL", "%s métrica %d sin %s" % (slug, i, field)))
    return out or [("PASS", "")]

def gate_material(mode):
    g7, res = g7_text(), []
    for slug, fm, ok, _ in projects():
        pf = (pending_list(fm) or []) if ok else []
        problems = []
        webps = disk_webps(slug)
        good = [p for p in webps if size_of(main_path(p)) == (1600, 1000)]
        bad = [p for p in webps if p not in good]
        for p in bad:
            res.append(("FAIL", "%s no mide 1600x1000" % p))
        if len(good) < 3:
            problems.append("%d de 3 WebP 1600x1000" % len(good))
        if fm.get("sampleData") is True and not os.path.isfile(main_path("material/%s/README.md" % slug)):
            problems.append("sin README.md (datos de ejemplo)")
        if problems:
            res.append(pending_or_defer(mode, g7, "material/" + slug,
                                        "%s: %s" % (slug, ", ".join(problems)), "media" in pf))
    return finish(res)

def gate_pii_list(mode):
    paths, err = pii_list()
    if err:
        return [("FAIL", err)]
    g7, out = g7_text(), []
    for p in paths:
        if os.path.isfile(main_path(p)):
            continue
        if parse_clearance(g7, p) == "quitar":
            continue
        out.append(("FAIL", "%s está en la lista pero no existe en material/ y Teo no la quitó" % p))
    return out or [("PASS", "")]

def gate_copy_pending(mode):
    """'Pendiente:' lines left in docs/copy.md (e.g. the Sofka bullets, G6)."""
    g7, res, heading = g7_text(), [], ""
    for line in (read("docs/copy.md") or "").splitlines():
        if line.startswith("#"):
            heading = line.lstrip("#").strip()
        elif re.match(r"^\s*-\s*Pendiente\s*:", line):
            target = re.sub(r"[^a-z0-9-]", "", heading.split(" ")[0].lower()) or "copy"
            res.append(pending_or_defer(mode, g7, target,
                                        "docs/copy.md '%s': línea Pendiente" % heading, True))
    return finish(res)

def gate_content_complete(mode):
    g7, items, res = g7_text(), [], []
    for slug, fm, ok, _ in projects():
        if not ok:
            res.append(("FAIL", "%s: front-matter ilegible" % slug)); continue
        pf = pending_list(fm)
        if pf is None:
            res.append(("FAIL", "%s: pendingFields mal formado" % slug)); continue
        fields = list(pf)
        if fm.get("coverImage") is None and "coverImage" not in fields:
            fields.append("coverImage (null)")
        if not fields:
            continue
        what = "%s: %s" % (slug, ", ".join(fields))
        if mode == "pre":
            items.append(what)
        elif deferred(g7, slug):
            res.append(("DEFER", "%s (%s: 'aplazar: %s')" % (what, DEF_NOTE, slug)))
        else:
            res.append(("FAIL", what))
    if mode == "pre":
        return [("SKIP", "pending G7: " + ("; ".join(items) if items else "ninguno"))]
    return res or [("PASS", "")]

def gate_g7_option(mode):
    opt = parse_g7(g7_text())
    if opt in ("aprobar", "aprobar-con-cambios"):
        return [("PASS", "")]
    return [("FAIL", "la opción de Teo en G7 se lee %s" % opt)]

def gate_content_approved(mode):
    out = []
    for slug, fm, ok, _ in projects():
        if fm.get("enStatus") != "approved":
            out.append(("FAIL", "%s: enStatus %s" % (slug, fm.get("enStatus"))))
        if (fm.get("media") or []) and fm.get("altStatus") != "approved":
            out.append(("FAIL", "%s: altStatus %s" % (slug, fm.get("altStatus"))))
    return out or [("PASS", "")]

def gate_design_approved(mode):
    d = read("DESIGN.md") or ""
    want = parse_g3(block(read(ANS09), G3_HEAD) or "")
    line = next((l for l in d.splitlines() if l.startswith("Estado:")), "")
    if "Estado: APROBADO" not in d:
        return [("FAIL", "DESIGN.md no dice 'Estado: APROBADO'")]
    m = re.findall(r"variante\s+([abc])\b", line, re.I)
    got = {x.lower() for x in m}
    if len(got) != 1 or got.pop() != want:
        return [("FAIL", "la variante que nombra la línea Estado de DESIGN.md no es la de G3 (%s)" % want)]
    return [("PASS", "")]

def gate_pii_cleared(mode):
    g7 = g7_text()
    paths, err = pii_list()
    if err:
        return [("FAIL", err)]
    tracked = set(tracked_material())
    out = []
    for p in paths:
        if p in tracked and parse_clearance(g7, p) != "liberar":
            out.append(("FAIL", "%s está publicada sin 'liberar:' de Teo" % p))
    for p in sorted(tracked):
        if parse_clearance(g7, p) == "quitar":
            out.append(("FAIL", "%s está publicada y Teo escribió 'quitar:'" % p))
    return out or [("PASS", "")]

def gate_captures_reviewed(mode):
    g7, out = g7_text(), []
    for p in tracked_material():
        if p.endswith(".webp"):
            st = review_state(g7, p)
            if st != "revisada":
                out.append(("FAIL", "%s se lee %s" % (p, st)))
    return out or [("PASS", "")]

def gate_permission_cleared(mode):
    g7, out = g7_text(), []
    tracked = tracked_material()
    for slug, fm, ok, path in projects():
        if parse_permission(read(path)) == "con-permiso":
            continue
        for p in tracked:
            if p.startswith("material/%s/" % slug) and p.endswith(".webp") and parse_clearance(g7, p) != "liberar":
                out.append(("FAIL", "%s %s sin liberar (sin permiso del cliente)" % (slug, p)))
    return out or [("PASS", "")]

def gate_material_committed(mode):
    g7, res = g7_text(), []
    tracked = tracked_material()
    slugs = {}
    for slug, fm, ok, _ in projects():
        slugs[slug] = fm
    for p in tracked:
        parts = p.split("/")
        ok_shape = len(parts) == 3 and parts[1] in slugs and (WEBP.match(parts[2]) or parts[2] == "README.md")
        if not ok_shape:
            res.append(("FAIL", "%s está versionado y no es NN-*.webp ni README.md de un proyecto" % p))
    for slug, fm in slugs.items():
        good = [p for p in tracked if p.startswith("material/%s/" % slug) and WEBP.match(p.split("/")[-1])
                and size_of(p) == (1600, 1000)]
        problems = []
        if len(good) < 3:
            problems.append("%d de 3 WebP 1600x1000 versionadas" % len(good))
        if fm.get("sampleData") is True and "material/%s/README.md" % slug not in tracked:
            problems.append("README.md sin versionar")
        if problems:
            what = "%s: %s" % (slug, ", ".join(problems))
            if deferred(g7, "material/" + slug):
                res.append(("DEFER", "%s (%s: 'aplazar: material/%s')" % (what, DEF_NOTE, slug)))
            else:
                res.append(("FAIL", what))
    return res or [("PASS", "")]

GATES = {
    "g1-record": gate_g1_record,
    "legitimacy-record": gate_legitimacy_record,
    "content-media": gate_content_media,
    "metric-sources": gate_metric_sources,
    "material": gate_material,
    "pii-list": gate_pii_list,
    "copy-pending": gate_copy_pending,
    "content-complete": gate_content_complete,
    "g7-option": gate_g7_option,
    "content-approved": gate_content_approved,
    "design-approved": gate_design_approved,
    "pii-cleared": gate_pii_cleared,
    "captures-reviewed": gate_captures_reviewed,
    "permission-cleared": gate_permission_cleared,
    "material-committed": gate_material_committed,
}

def print_gate(name, results):
    for status, detail in results:
        if status == "PASS":
            print("PASS " + name)
        elif status == "SKIP":
            print("SKIP %s (%s)" % (name, detail))
        else:
            print("%s %s: %s" % (status, name, detail))

# ---------- reports ----------

def report_pii():
    paths, err = pii_list()
    if err:
        print("FAIL pii-list: " + err); return 1
    if not paths:
        print("pii: ninguno"); return 0
    g7, rc = g7_text(), 0
    for p in paths:
        v = parse_clearance(g7, p)
        print("%s %s" % (v, p))
        rc |= v == "pendiente"
    return int(rc)

def report_review():
    g7, rc = g7_text(), 0
    for p in disk_webps():
        st = review_state(g7, p)
        print("%s %s" % (st, p))
        rc |= st == "pendiente"
    return int(rc)

def report_permission():
    g7, rc, any_sin = g7_text(), 0, False
    for slug, fm, ok, path in projects():
        if parse_permission(read(path)) == "con-permiso":
            continue
        any_sin = True
        webps = disk_webps(slug)
        if not webps:
            print("sin-capturas material/%s/" % slug)
        for p in webps:
            v = parse_clearance(g7, p)
            print("%s %s" % (v, p))
            rc |= v == "pendiente"
    if not any_sin:
        print("permiso: todos")
    return int(rc)

def main(argv):
    cmd = argv[0]
    if cmd == "gate":
        name, mode = argv[1], argv[2]
        print_gate(name, GATES[name](mode)); return 0
    if cmd == "parse-g1":
        print(parse_g1(sys.stdin.read(), int(argv[1]))); return 0
    if cmd == "parse-g7":
        print(parse_g7(sys.stdin.read())); return 0
    if cmd == "parse-clearance":
        print(parse_clearance(sys.stdin.read(), argv[1])); return 0
    if cmd == "parse-reviewed":
        print(parse_reviewed(sys.stdin.read())); return 0
    if cmd == "parse-deferral":
        print(parse_deferral(sys.stdin.read(), argv[1])); return 0
    if cmd == "parse-permission":
        print(parse_permission(sys.stdin.read())); return 0
    if cmd == "pii":
        return report_pii()
    if cmd == "review":
        return report_review()
    if cmd == "permission":
        return report_permission()
    return 2

sys.exit(main(sys.argv[1:]))
PYEOF

py() { python3 -I -c "$PY" "$@"; }

case "$MODE" in
  --parse-g1) py parse-g1 "$2"; exit $? ;;
  --parse-g7) py parse-g7; exit $? ;;
  --parse-clearance) py parse-clearance "$2"; exit $? ;;
  --parse-reviewed) py parse-reviewed; exit $? ;;
  --parse-deferral) py parse-deferral "$2"; exit $? ;;
  --parse-permission) py parse-permission; exit $? ;;
  --pii) py pii; exit $? ;;
  --review) py review; exit $? ;;
  --permission) py permission; exit $? ;;
esac

if [ "$MODE" = "--final" ]; then GMODE=final; else GMODE=pre; fi

PASSED=0; FAILED=0; SKIPPED=0; DEFERRED=0

# Print a gate's lines and count the gate once, by its worst line:
# FAIL > SKIP > DEFER > PASS.
tally() {
  local out="$1"
  [ -n "$out" ] && printf '%s\n' "$out"
  if printf '%s\n' "$out" | command grep -q '^FAIL '; then FAILED=$((FAILED + 1))
  elif printf '%s\n' "$out" | command grep -q '^SKIP '; then SKIPPED=$((SKIPPED + 1))
  elif printf '%s\n' "$out" | command grep -q '^DEFER '; then DEFERRED=$((DEFERRED + 1))
  elif printf '%s\n' "$out" | command grep -q '^PASS '; then PASSED=$((PASSED + 1))
  else printf 'FAIL internal: gate printed nothing\n'; FAILED=$((FAILED + 1)); fi
}

pygate() { tally "$(py gate "$1" "$GMODE" 2>&1)"; }

# Approval, review and publication gates wait for G7 under --pre-approval.
approval() {
  if [ "$GMODE" = pre ]; then tally "SKIP $1 (pre-approval: needs Teo's G7 answer, applied by 01-13)"; return; fi
  $2
}

# --- shell gates (command grep is the real binary, never an alias) ---

g_copy_markers() {
  local f=docs/copy.md r=""
  [ -f "$f" ] || { tally "FAIL copy-markers: falta $f"; return; }
  command grep -qE '\[(Teo escribe|ejemplo|ej\.|\.\.\.|sí/no|en qué)' "$f" && r="$r placeholder entre corchetes;"
  command grep -qE '^[[:space:]-]*>[[:space:]]*\[' "$f" && r="$r cita entre corchetes;"
  command grep -qE 'EN/ES bullets \(' "$f" && r="$r instrucción de número de bullets;"
  command grep -qE '^#+[[:space:]]*Proyectos' "$f" && r="$r encabezado Proyectos;"
  command grep -q $'\xe2\x80\x94' "$f" && r="$r raya larga U+2014;"
  if [ -n "$r" ]; then tally "FAIL copy-markers:$r"; else tally "PASS copy-markers"; fi
}

g_content_files() {
  local n
  n=$(find docs/content -maxdepth 1 -name '*.md' ! -name README.md | wc -l | tr -d ' ')
  if [ "$n" != 4 ]; then tally "FAIL content-files: $n archivos de proyecto en docs/content (se esperan 4)"; return; fi
  if CONTENT_MIN_FILES=4 pnpm -s content:check >/dev/null 2>&1; then tally "PASS content-files"
  else tally "FAIL content-files: CONTENT_MIN_FILES=4 pnpm content:check falla"; fi
}

g_content_dashes() {
  if command grep -l $'\xe2\x80\x94' docs/content/*.md >/dev/null 2>&1; then
    tally "FAIL content-dashes: raya larga U+2014 en $(command grep -l $'\xe2\x80\x94' docs/content/*.md | tr '\n' ' ')"
  else tally "PASS content-dashes"; fi
}

g_design_mechanics() {
  local f=DESIGN.md r=""
  command grep -q 'next/font/google' "$f" || r="$r no nombra next/font/google;"
  command grep -qE 'next/font/local|localFont' "$f" && r="$r menciona un cargador de fuentes locales;"
  command grep -qE '\[data-[a-z-]+=?"?dark' "$f" && r="$r selector de atributo para el tema oscuro;"
  command grep -q 'Teo escribe aquí dos frases' "$f" && r="$r sigue el placeholder del concepto;"
  if [ -n "$r" ]; then tally "FAIL design-mechanics:$r"; else tally "PASS design-mechanics"; fi
}

g_pdf_fonts() {
  local r=""
  for o in OFL-FunnelDisplay.txt OFL-GeistMono.txt OFL-HankenGrotesk.txt; do
    [ -f "assets/fonts-pdf/$o" ] || r="$r falta $o;"
  done
  python3 -I scripts/verify-pdf-fonts.py assets/fonts-pdf/*.ttf >/dev/null 2>&1 || r="$r verify-pdf-fonts.py falla;"
  if [ -n "$r" ]; then tally "FAIL pdf-fonts:$r"; else tally "PASS pdf-fonts"; fi
}

g_decisions() {
  local r="" e
  for e in "Variante del hero elegida" "Aprobaciones de arranque de la fase 1" \
           "Política de material/ (D-15, reconfirmada por Teo)" \
           "Métricas bilingües en docs/content (decidió Teo)" \
           "Inglés de IDEN-07 y del criterio 4 aprobado por Teo (D-07)"; do
    command grep -qF "$e" docs/decisions.md || r="$r falta '$e';"
  done
  if [ -n "$r" ]; then tally "FAIL decisions:$r"; else tally "PASS decisions"; fi
}

g_copy_approved() {
  if command grep -q 'draft-translation' docs/copy.md; then
    tally "FAIL copy-approved: docs/copy.md tiene $(command grep -c 'draft-translation' docs/copy.md) marcas draft-translation"
  else tally "PASS copy-approved"; fi
}

g_fixture_approved() {
  if command grep -qE 'headlineEnStatus: "approved"' src/features/site-settings/fixture.ts; then tally "PASS fixture-approved"
  else tally "FAIL fixture-approved: heroFixtureMeta.headlineEnStatus no es approved"; fi
}

g_herocopy_approved() {
  if command grep -qE 'status: "approved"($|,| ?\})' src/components/site/hero-copy.ts; then tally "PASS herocopy-approved"
  else tally "FAIL herocopy-approved: heroCopyMeta.status no es approved"; fi
}

# --- run every gate, even after a failure ---

pygate g1-record
pygate legitimacy-record
g_copy_markers
pygate copy-pending
g_content_files
pygate content-media
g_content_dashes
pygate metric-sources
g_design_mechanics
g_pdf_fonts
pygate material
pygate pii-list
g_decisions
pygate content-complete
approval g7-option "pygate g7-option"
approval content-approved "pygate content-approved"
approval copy-approved g_copy_approved
approval fixture-approved g_fixture_approved
approval herocopy-approved g_herocopy_approved
approval design-approved "pygate design-approved"
approval pii-cleared "pygate pii-cleared"
approval captures-reviewed "pygate captures-reviewed"
approval permission-cleared "pygate permission-cleared"
approval material-committed "pygate material-committed"

echo "phase 1 gate: $PASSED passed, $FAILED failed, $SKIPPED skipped, $DEFERRED deferred"
[ "$FAILED" -eq 0 ]
