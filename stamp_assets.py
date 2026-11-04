"""
Sets every local CSS/JS reference in the root HTML pages to a content hash:
styles.css?v=<sha1[:12]>. Run after editing any stylesheet or script so all
pages share one cache key per file and browsers pick up the change.

    python stamp_assets.py          # rewrite in place
    python stamp_assets.py --check  # exit 1 if anything is stale (for CI)
"""

import glob
import hashlib
import re
import sys

PATTERN = re.compile(r'((?:href|src)="/?)([\w.-]+\.(?:css|js))(?:\?v=[^"]*)?"')


def digest(path, cache={}):
    if path not in cache:
        with open(path, "rb") as f:
            cache[path] = hashlib.sha1(f.read()).hexdigest()[:12]
    return cache[path]


def stamp(text):
    def sub(m):
        prefix, name = m.groups()
        try:
            return f'{prefix}{name}?v={digest(name)}"'
        except FileNotFoundError:
            return m.group(0)
    return PATTERN.sub(sub, text)


def main():
    check = "--check" in sys.argv
    stale = []
    for page in sorted(glob.glob("*.html")):
        with open(page, encoding="utf-8") as f:
            text = f.read()
        new = stamp(text)
        if new != text:
            stale.append(page)
            if not check:
                with open(page, "w", encoding="utf-8") as f:
                    f.write(new)
    print(("Stale: " if check else "Stamped: ") + (", ".join(stale) or "nothing"))
    sys.exit(1 if check and stale else 0)


if __name__ == "__main__":
    main()
