# Design: Automated Docs Sync from devportal-platform Releases

**Date:** 2026-06-29  
**Status:** Approved  
**Author:** Giovani (brainstormed with Claude)

---

## Problem

When `devportal-platform` ships a release that changes behavior (e.g., replacing PVC storage with PostgreSQL for plugin installation), the corresponding documentation in `veecode-platform/docs` goes stale silently. There is no automated signal connecting a release in the image repo to a docs update in the docs repo.

The change that triggered this design: [commit 75baf07](https://github.com/veecode-platform/devportal-platform/commit/75baf075574dd50b06d8048861de91df7a2ec60e) — PVC → PostgreSQL for plugin persistence — was not reflected in docs.

---

## Non-goals

- Auto-merging doc PRs without human review.
- Syncing changelogs or release notes (prose, not structured data).
- Covering repos other than `devportal-platform` → `docs`.
- Full AI rewrite of docs sections — only surgical patches.

---

## Architecture

### Trigger

GitHub Actions workflow in `devportal-platform`, triggered on `on: release: published`. Fires once per published release, not on every push.

### Flow

```
devportal-platform (on: release)
    │
    ├─ [1] git diff prev_tag..release_tag  →  /tmp/release.diff
    │
    ├─ [2] checkout veecode-platform/docs  →  docs-repo/
    │
    ├─ [3] grep dp-source anchors vs diff domains  →  /tmp/affected_files.txt
    │
    ├─ [4] build prompt (template + diff + file contents)  →  /tmp/final-prompt.txt
    │
    ├─ [5] claude -p "$(cat /tmp/final-prompt.txt)"  →  /tmp/claude-output.txt
    │
    ├─ [6] parse output: extract PATCHES, PR_BODY
    │
    ├─ [7] apply unified diffs with `patch -p1`
    │
    └─ [8] git commit + gh pr create → veecode-platform/docs
```

### Cross-repo authentication

A secret `DOCS_REPO_TOKEN` (GitHub PAT with `repo` scope, or a GitHub App token) in `devportal-platform` is used for:
- Checking out `veecode-platform/docs`
- `git push` to a new branch in `veecode-platform/docs`
- `gh pr create` targeting `veecode-platform/docs`

The existing `ANTHROPIC_API_KEY` secret is used for `claude -p`.

---

## Anchor Comments (docs side)

Documentation sections that describe behavior derived from `devportal-platform` carry an invisible HTML comment marking which domains they cover:

```html
<!-- dp-source: storage,pvc,postgres -->
```

**Convention:**
- Tag is placed immediately before the paragraph or section header it governs.
- Domains are comma-separated, lowercase, drawn from a shared vocabulary (see below).
- A single file can have multiple `dp-source` tags for different sections.

**Shared domain vocabulary (seed list):**

| Domain | Covers |
|---|---|
| `storage` | Volume mounts, persistent storage, PVC |
| `pvc` | PersistentVolumeClaim specifically |
| `postgres` | PostgreSQL backend for any feature |
| `plugin` | Plugin installation / loading mechanism |
| `entrypoint` | Boot script, entrypoint.sh behavior |
| `preset` | Preset system and VEECODE_PRESETS |
| `helm` | Helm chart values and chart behavior |
| `env` | Required environment variables |

New domains are added to this table when a new behavioral area is first documented.

**Anchor seeding (bootstrap):** On implementation, the following files receive their initial anchors based on current content:

- `devportal/installation-guide/production-setup/setup.md` — `storage,pvc,helm`
- `devportal/installation-guide/production-setup/plan.md` — `storage,helm,env`
- `devportal/plugins/adding.md` — `plugin,entrypoint`
- `devportal/installation-guide/docker-local/custom-plugins.md` — `plugin`

---

## Claude Prompt Design

Stored at `.github/prompts/sync-docs.md` in `devportal-platform`. Uses:

- **Role-based context:** surgical technical writer, not allowed to invent.
- **Chain-of-thought (4 steps):** extract semantic changes → map to stale docs → write minimal patches → verify each hunk.
- **Structured output:** named sections (`ANALYSIS`, `PATCHES`, `PR_BODY`, `UNCERTAIN`) for reliable parsing.
- **Hard constraints block:** explicit list of what Claude must never do.
- **Escape hatch:** `NO_CHANGES_NEEDED` single-line output skips PR creation.

Model: `claude-sonnet-4-6` (cost/quality balance for a CI task).

Output parsing uses Python (regex on named sections) rather than JSON mode, because the diff format inside the output would require double-escaping in JSON. The `PATCHES` section contains standard unified diffs applied with `patch -p1`.

---

## Failure modes and handling

| Failure | Handling |
|---|---|
| No semantic changes in diff | `NO_CHANGES_NEEDED` → workflow exits cleanly, no PR |
| No affected files (no anchor match) | Step skipped, workflow exits with info log |
| `patch` fails to apply | Step fails with non-zero exit, workflow fails visibly; no PR created |
| Claude output malformed (no named sections) | Python parser raises, workflow fails; no partial PR |
| Duplicate PR for same release tag | `gh pr create` fails if branch already exists; idempotent by branch name `docs-sync/<tag>` |
| `DOCS_REPO_TOKEN` expired | `gh pr create` fails with 401; secret rotation needed |

No silent failures. Every error surfaces as a failed workflow run in the `devportal-platform` Actions tab.

---

## Files to create

| Repo | Path | Purpose |
|---|---|---|
| `devportal-platform` | `.github/workflows/sync-docs.yml` | Main workflow |
| `devportal-platform` | `.github/prompts/sync-docs.md` | Prompt template |
| `docs` (this repo) | `devportal/installation-guide/production-setup/setup.md` | Add `dp-source` anchors |
| `docs` (this repo) | `devportal/installation-guide/production-setup/plan.md` | Add `dp-source` anchors |
| `docs` (this repo) | `devportal/plugins/adding.md` | Add `dp-source` anchors |
| `docs` (this repo) | `devportal/installation-guide/docker-local/custom-plugins.md` | Add `dp-source` anchors |

---

## Immediate manual fix (before implementation)

The change that motivated this design (`75baf07` — PVC → PostgreSQL) is already stale in `setup.md`. The no-Helm fallback section still reads "This manifest applies the same two PVCs". This must be corrected manually as a prerequisite, before the automated system exists. It is **not** handled by this workflow — the workflow only catches future releases.

---

## Out of scope for v1

- Slack/email notification when a PR is opened.
- Scoring or confidence threshold before creating PR.
- Rollback if Claude patch introduces a regression.
- Support for repos other than `devportal-platform`.
