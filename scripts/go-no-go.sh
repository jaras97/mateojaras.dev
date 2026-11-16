#!/usr/bin/env bash
# Day-3 go/no-go between Cache Components and Plan B (ISR), BASE-09.
# Usage: bash scripts/go-no-go.sh
# Runs signals 1-6 of the RESEARCH protocol on the production build
# (`pnpm build && pnpm start -p 3100`) against the seeded dev branch.
# Prints one PASS/FAIL line per signal; exits 1 if any signal fails.
set -uo pipefail
cd "$(dirname "$0")/.."

PORT=3100
BASE="http://localhost:$PORT"
LOG="${TMPDIR:-/tmp}/go-no-go-build.log"
E2E_LOG="${TMPDIR:-/tmp}/go-no-go-e2e.log"
FAILS=0
SERVER_PID=""

pass() { echo "PASS signal $1${2:+: $2}"; }
fail() { echo "FAIL signal $1: $2"; FAILS=$((FAILS + 1)); }
cleanup() { [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null; pkill -f "next-server" 2>/dev/null; true; }
trap cleanup EXIT

if curl -s -o /dev/null "$BASE/"; then echo "FAIL: port $PORT already in use; a stale server would invalidate the signals"; exit 2; fi
echo "Next version: $(node -p "require('next/package.json').version")"

# Slugs from the content files: published = clientPermission true.
read -r PUBLISHED DRAFTS < <(node --input-type=module -e '
import { readdirSync, readFileSync } from "node:fs";
const pub = [], dr = [];
for (const f of readdirSync("docs/content").filter((f) => f.endsWith(".md") && f !== "README.md")) {
  const t = readFileSync("docs/content/" + f, "utf8");
  const slug = (t.match(/^slug:\s*(.+)$/m) || [])[1]?.trim().replace(/["\x27]/g, "");
  if (!slug) continue;
  (/^clientPermission:\s*true/m.test(t) ? pub : dr).push(slug);
}
console.log(pub.join(",") + " " + (dr.join(",") || "-"));
')
echo "Published: $PUBLISHED | Drafts: $DRAFTS"
FIRST="${PUBLISHED%%,*}"

# Signal 1: build route table.
pnpm build >"$LOG" 2>&1
BUILD_RC=$?
if [ $BUILD_RC -ne 0 ]; then
  fail 1 "build failed (see $LOG)"
elif grep -qE "Uncached data|empty-generate-static-params" "$LOG"; then
  fail 1 "build log has Uncached data / empty-generate-static-params"
elif ! grep -q "/\[locale\]" "$LOG" || ! grep -q "/\[locale\]/projects/\[slug\]" "$LOG"; then
  fail 1 "route table lacks /[locale] or /[locale]/projects/[slug]"
else
  NSLUG=$(echo "$PUBLISHED" | tr ',' '\n' | grep -c .)
  MORE=$(grep -oE "\[\+[0-9]+ more paths\]" "$LOG" | grep -oE "[0-9]+" | tail -1)
  # The route table lists a few paths and truncates the rest as "[+N more paths]".
  PAGES=$(( $(grep -cE "projects/[a-z]" "$LOG") + ${MORE:-0} ))
  if [ "$PAGES" -lt $((NSLUG * 2)) ]; then
    fail 1 "only $PAGES project paths for $NSLUG slugs x 2 locales"
  else
    pass 1 "$PAGES project paths prerendered"
  fi
fi

pnpm start -p $PORT >/dev/null 2>&1 &
SERVER_PID=$!
for _ in $(seq 1 60); do curl -s -o /dev/null "$BASE/" && break; sleep 1; done

code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

# Signal 2: lang attributes, titles, Accept-Language ignored.
EN=$(curl -s "$BASE/"); ES=$(curl -s "$BASE/es"); ENACC=$(curl -s -H 'Accept-Language: es' "$BASE/")
if echo "$EN" | grep -q '<html[^>]*lang="en"' && echo "$ES" | grep -q '<html[^>]*lang="es"' \
  && echo "$ENACC" | grep -q '<html[^>]*lang="en"' && echo "$EN" | grep -q "ManuJ"; then
  pass 2; else fail 2 "lang attributes, titles or Accept-Language behavior wrong"; fi

# Signal 3: localized URLs and redirect.
C1=$(code "$BASE/es/proyectos/$FIRST"); C2=$(code "$BASE/projects/$FIRST")
LOC=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$BASE/es/projects/$FIRST")
if [ "$C1" = 200 ] && [ "$C2" = 200 ] && echo "$LOC" | grep -qE "^30[0-9] .*/es/proyectos/$FIRST$"; then
  pass 3; else fail 3 "es=$C1 en=$C2 redirect='$LOC'"; fi

# Signal 4 (re-scoped by Teo, decisions.md): draft and unknown slugs show the
# not-found UI with noindex and never leak draft content. Status 200 or 404 is
# accepted: Cache Components sends the shell first (loading.md "Status codes").
BAD=""
for s in ${DRAFTS//,/ } no-existe; do
  [ "$s" = "-" ] && continue
  for p in "/projects/$s" "/es/proyectos/$s"; do
    c=$(code "$BASE$p"); B=$(curl -s "$BASE$p")
    case "$c" in 200|404) ;; *) BAD="$BAD $p=$c" ;; esac
    echo "$B" | grep -q 'name="robots" content="noindex"' || BAD="$BAD $p:no-noindex"
    echo "$B" | grep -qE "Page not found|Página no encontrada" || BAD="$BAD $p:no-not-found-ui"
  done
done
if [ -z "$BAD" ]; then pass 4 "not-found UI + noindex (status 200 or 404)"; else fail 4 "$BAD"; fi

# Signal 5: admin login, reload, logout via the auth e2e specs on this server.
pnpm exec playwright test e2e/auth.spec.ts e2e/auth-api.spec.ts >"$E2E_LOG" 2>&1
if [ $? -eq 0 ]; then pass 5; else fail 5 "auth e2e failed (see $E2E_LOG)"; fi

# Signal 6: cross-locale after repeated warm requests.
read -r EN_H ES_H < <(node -p 'const e=require("./messages/en.json").Site.home.projectsHeading,s=require("./messages/es.json").Site.home.projectsHeading;e+"|"+s' | tr '|' ' ')
BAD6=""
for _ in 1 2 3 4 5; do
  A=$(curl -s "$BASE/"); B=$(curl -s "$BASE/es")
  echo "$A" | grep -q ">$EN_H<" || BAD6="$BAD6 /-missing-en"
  echo "$A" | grep -q ">$ES_H<" && BAD6="$BAD6 /-has-es"
  echo "$B" | grep -q ">$ES_H<" || BAD6="$BAD6 /es-missing-es"
  echo "$B" | grep -q ">$EN_H<" && BAD6="$BAD6 /es-has-en"
done
if [ -z "$BAD6" ]; then pass 6; else fail 6 "$BAD6"; fi

echo "SKIP signal 7: read-your-writes verificado en la fase 3"
[ $FAILS -eq 0 ] && echo "VERDICT: GO" || echo "VERDICT: $FAILS signal(s) failed"
[ $FAILS -eq 0 ]
