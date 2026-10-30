"""Gate for the CV PDF fonts in assets/fonts-pdf/ (decision D-19).

Usage: python3 -I scripts/verify-pdf-fonts.py assets/fonts-pdf/*.ttf

For every file given it checks that the font:
  - is static (no fvar table: react-pdf's fontkit only renders the default
    instance of a variable font),
  - has the OS/2 usWeightClass its name promises (Regular/Italic 400,
    SemiBold 600, Bold 700),
  - is slanted when its name ends in -Italic (post.italicAngle != 0),
  - maps every Spanish character in SPANISH in its cmap.

Prints "OK <file> weight=<n> glyphs=<count>" or "FAIL <file>: <reason>" per
file and exits 1 if any file failed or no file was given. fontTools is a local
tool here, never a project dependency.
"""

import os
import sys

from fontTools.ttLib import TTFont

SPANISH = "áéíóúüñÁÉÍÓÚÜÑ¿¡"
WEIGHTS = {"Regular": 400, "Italic": 400, "SemiBold": 600, "Bold": 700}


def check(path):
    name = os.path.splitext(os.path.basename(path))[0]
    style = name.rsplit("-", 1)[-1] if "-" in name else ""
    if style not in WEIGHTS:
        return False, f"unknown style suffix '{style}' (expected one of {', '.join(WEIGHTS)})"

    try:
        font = TTFont(path)
    except Exception as error:  # noqa: BLE001 - any parse error fails the gate
        return False, f"cannot open: {error}"

    if "fvar" in font:
        return False, "variable font (has fvar table)"

    weight = font["OS/2"].usWeightClass
    if weight != WEIGHTS[style]:
        return False, f"usWeightClass {weight}, expected {WEIGHTS[style]} for {style}"

    if style == "Italic" and font["post"].italicAngle == 0:
        return False, "italicAngle is 0 for an Italic file"

    cmap = font.getBestCmap() or {}
    missing = [char for char in SPANISH if ord(char) not in cmap]
    if missing:
        return False, "missing glyphs " + " ".join(missing)

    return True, f"weight={weight} glyphs={len(cmap)}"


def main(paths):
    if not paths:
        print("FAIL: no font files given", file=sys.stderr)
        return 1

    failed = False
    for path in paths:
        ok, detail = check(path)
        if ok:
            print(f"OK {path} {detail}")
        else:
            failed = True
            print(f"FAIL {path}: {detail}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
