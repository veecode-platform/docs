"""Freeze the DevPortal 2.x docs as the `v2` version before the current tree becomes 3.x.

Copies devportal/ to versioned_docs/version-v2/ without the 3.x pages, registers the
version, and rewrites absolute /devportal/ links inside the copy to /devportal/v2/,
because the site root serves 3.x after the cut. Links that point at 3.x on purpose
(the 3.x section and the 2.x to 3.x migration guide) keep their target.
Run once from the repository root; it refuses to run when version-v2 already exists.
"""
import json
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path.cwd()
SOURCE = ROOT / "devportal"
TARGET = ROOT / "versioned_docs" / "version-v2"
THREE_X = {"v3", "migrating-from-2x.md"}
KEEP_TARGETS = ("/devportal/v1/", "/devportal/v2/", "/devportal/v3/", "/devportal/migrating-from-2x")

if TARGET.exists():
    sys.exit(f"{TARGET} already exists; the cut has been made")

shutil.copytree(SOURCE, TARGET, ignore=lambda d, names: [n for n in names if pathlib.Path(d) == SOURCE and n in THREE_X])

link = re.compile(r'(\]\(|link=")(/devportal/[^)"\s]*)')


retargeted = 0


def retarget(match):
    global retargeted
    prefix, url = match.groups()
    if url.startswith(KEEP_TARGETS) or url == "/devportal/":
        return match.group(0)
    retargeted += 1
    return prefix + "/devportal/v2/" + url[len("/devportal/"):]


for page in sorted(TARGET.rglob("*.md*")):
    text = page.read_text()
    new = link.sub(retarget, text)
    if new != text:
        page.write_text(new)

versions_file = ROOT / "versions.json"
versions = json.loads(versions_file.read_text())
if "v2" not in versions:
    versions.insert(0, "v2")
    versions_file.write_text(json.dumps(versions, indent=2) + "\n")

sidebars = ROOT / "versioned_sidebars"
shutil.copyfile(sidebars / "version-v1-sidebars.json", sidebars / "version-v2-sidebars.json")

pages = sum(1 for _ in TARGET.rglob("*.md*"))
print(f"version-v2: {pages} pages copied, {retargeted} links retargeted to /devportal/v2/; versions.json = {versions}")
