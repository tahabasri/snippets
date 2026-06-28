# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A VS Code extension ("Snippets", publisher `tahabasri`) for managing code snippets and AI prompts in a tree view. It also runs in Cursor and Windsurf, which are detected at runtime and change available commands and welcome text.

## Commands

```bash
npm run compile        # webpack dev build -> dist/extension.js
npm run watch          # webpack watch mode for development
npm run package        # production webpack build (used by vscode:prepublish)
npm run lint           # eslint over src (--ext ts)
npm run test-compile   # tsc -p ./  -> compiles to out/ (required before tests)
npm test               # runs out/test/runTest.js via @vscode/test-electron
```

Run/debug the extension itself with VS Code's "Run Extension" launch config (F5), not from the CLI.

### Tests

- `npm test` launches a headless VS Code instance and runs every `out/**/*.test.js` through Mocha (TDD `suite`/`test` style, see `src/test/suite/index.ts`).
- Tests **must** be compiled first with `npm run test-compile` — `npm test` runs the JS in `out/`, not the TS in `src/`. `pretest` chains compile + lint automatically when you run `npm test`.
- There is no built-in single-test filter in the npm scripts. To run one suite, temporarily narrow the glob in `src/test/suite/index.ts` or use Mocha's `.only` on a `suite`/`test`, then recompile.
- Tests use `sinon` for stubbing the `vscode` API. Snippet-logic suites (`snippetService.test.ts`, `snippetProvider*.test.ts`) exercise the in-memory model; `aiIntegration.test.ts` covers the Copilot/Cursor/Gemini commands.

> Two build pipelines coexist: **webpack** produces the shipped bundle (`dist/`), **tsc** produces `out/` for tests only. `main` in package.json points at `dist/extension`.

## Architecture

The data flows in one direction: a `DataAccess` storage backend ⟶ `SnippetService` (in-memory tree + mutations) ⟶ `SnippetsProvider` (VS Code `TreeDataProvider`) ⟶ command functions in `config/commands.ts`. Everything is wired together in `activate()` in `src/extension.ts`.

### Snippet model (`src/interface/snippet.ts`)

Everything — folders and snippets — is a `Snippet`. A folder has `folder: true` and a `children` array; a leaf snippet has a `value`. The whole dataset is a single tree under one root node (`id: 1`, `parentId: -1`, see `DataAccessConsts.defaultRootElement`). IDs are integers handed out via a monotonic `lastId` stored on the root; `SnippetService.incrementLastId()` / `fixLastId()` keep it consistent (corruption here is the root cause of the "Troubleshoot Snippets" feature).

### Storage layer (`src/data/`)

`DataAccess` is an interface with two implementations — pick is by scope:
- `MementoDataAccess` — **global** snippets, persisted in `context.globalState` under key `snippetsData`. Registered for VS Code Settings Sync (`setKeysForSync`), so global snippets sync across machines.
- `FileDataAccess` — **workspace** snippets, persisted to `.vscode/snippets.json`. Enabled only when the `snippets.useWorkspaceFolder` setting is on. Also used transiently for import/export to arbitrary JSON files.

The whole tree is serialized/deserialized as one JSON blob on every save — there is no per-snippet persistence.

### Service (`src/service/snippetService.ts`)

Holds the root `Snippet` in memory and is the only place that mutates the tree (add/update/remove/move/sort/import/export). Recursive helpers `findParent`, `flatten`, and `flattenAndKeepFolders` are the workhorses. Call `service.saveSnippets()` to flush to the backing `DataAccess`; the service does **not** auto-save on mutation — `SnippetsProvider.sync()` is what persists + refreshes the tree.

### Provider (`src/provider/snippetsProvider.ts`)

Implements both `TreeDataProvider<Snippet>` and `TreeDragAndDropController<Snippet>`. Wraps `SnippetService`, converts `Snippet`s to `TreeItem`s (icons, context values, language binding), and after any mutation calls `sync()` → save + `refresh()` (fires `onDidChangeTreeData`). Drag-and-drop reparenting and the guard against dropping a folder into its own descendant live in `handleDrop`.

### Global vs Workspace duality

There are **two parallel instances** of the service+provider: a global pair (always present) and a workspace pair (`ws*`, created only when `useWorkspaceFolder` is enabled). This is why commands come in `globalSnippetsCmd.*` / `wsSnippetsCmd.*` variants plus shared `commonSnippetsCmd.*` ones that prompt the user to choose a target view. Two tree views are contributed: `snippetsExplorer` and `wsSnippetsExplorer`.

### Commands (`src/config/commands.ts`)

`CommandsConsts` enum is the single source of truth for command IDs and **must stay in sync with the `contributes.commands` / `menus` declarations in package.json**. The exported functions are the command bodies; they are registered in `activate()`. `when` clauses in package.json gate menu visibility on runtime context keys set via `setContext`: `snippets.host` (`vscode`|`cursor`|`windsurf`), `snippets.workspaceState` (`fileAvailable`), and `snippets.actionMode` (`button`|`inline`).

### IntelliSense completion

`activate()` registers a `CompletionItemProvider` (re-registered when settings change) that surfaces snippets as completions, triggered by the `snippets.triggerKey` character (default `>`). Prefix/global-prefix and camelize settings shape the suggestion labels.

### AI integration

Copilot/Cursor/Gemini commands (`askGithubCopilot`, `addToChat`, `addAsCodeSnippetToChat`) work by opening the relevant chat command and pasting the snippet via the clipboard (saving/restoring prior clipboard content). Menu visibility is gated on host detection and on the respective assistant being active (`github.copilot.activated`, `snippets.host == cursor`, `config.geminicodeassist.enable`).

### Other pieces

- `src/views/` — webview panels (`editSnippet`, `editSnippetFolder`, `newRelease`); HTML templates live in top-level `views/*.html` and are rendered with **Mustache**.
- `src/utility/` — `uiUtility` (input prompts, language list), `stringUtility` (formatting/camelize/blank checks), `loggingUtility` (winston → VS Code output channel singleton, `LoggingUtility.getInstance()`).
- `src/config/labels.ts` — all user-facing strings, centralized.

## Release management & issue workflow

The project ships through the VS Code Marketplace. Development is PR-driven into `main`, and releases are cut on dedicated branches. The git history shows a consistent rhythm: many small issue/feature PRs accumulate on `main`, then one `release/X.Y.Z` PR bundles them into a published version.

### Handling a single issue (the per-issue loop)

Each GitHub issue is taken one at a time and follows the same cycle:

1. **Branch off `main`**, named after the issue: `<issue#>-<short-kebab-desc>` (e.g. `98-import-without-overwritting`, `123-global-snippets-completion`, `68-troubleshoot-snippets`). Larger cross-cutting work uses `feature/<name>` instead (e.g. `feature/github-copilot-support`); dependency bumps come from `dependabot/...`.
2. **Implement + commit.** Commits that map to an issue are often prefixed with the issue/PR number in brackets, e.g. `[#122] Use 25 rows in editSnippet UI`. Keep the change scoped to that one issue.
3. **Open a PR into `main`.** CI must pass before merge:
   - `.github/workflows/unit-tests.yml` — runs `npm test` on macOS, Ubuntu (via `xvfb-run`), and Windows.
   - `.github/workflows/code-analysis.yml` — static analysis.
4. **Merge into `main`** as a merge commit. The convention is GitHub's default message: `Merge pull request #NNN from tahabasri/<branch>`.
5. At this point `main` has the fix but **no version bump and no CHANGELOG entry** — those are deferred to the release step. Repeat for the next issue.

### Cutting a release (bundling issues into a version)

Once enough issues have landed on `main`, a release is prepared on a `release/X.Y.Z` branch. A release PR touches these files together (see commits like `Prepare 3.1.0 Changelog`, `Update Release files`):

1. **`package.json`** — bump the `version` field (semver: breaking/major feature → major, e.g. `3.1.0` → `4.0.0`; new features → minor; dependency-only/security patches → patch like `2.2.1` → `2.2.2`).
2. **`src/extension.ts`** — update the `changelogVersion` constant to the new version. This gates the one-time "What's New" (`NewRelease`) webview so it shows exactly once per release (only when `currentVersion === changelogVersion`).
3. **`CHANGELOG.md`** — add a new `### X.Y.Z` section **at the top**. Each line references its PR: `- [[#NNN](https://github.com/tahabasri/snippets/pull/NNN)] <description>`, with nested bullets for multi-part PRs. Dependency-only releases just say "Update vulnerable dependencies."
4. **`README.md` + `images/`** — add docs, feature GIFs, and the release cover for any new user-facing features.
5. **Open the `release/X.Y.Z` PR, let CI pass, and merge into `main`.**
6. **Publish to the Marketplace manually.** There is no publish GitHub Action — publishing is done by hand with [`vsce`](https://github.com/microsoft/vscode-vsce) (not a project dependency; run it via `npx` or a global install). Running `vsce` triggers the `vscode:prepublish` script → `npm run package` (production webpack build) automatically. The `version` in `package.json` is what gets published. Reference steps, run from a clean checkout of `main` after the release PR is merged:

   ```bash
   git checkout main && git pull          # ensure you're on the merged release commit
   npm install                            # clean, matching dependencies
   npx @vscode/vsce package               # build & sanity-check the .vsix locally (optional)
   npx @vscode/vsce publish               # publishes to the VS Code Marketplace
   # publishing requires a Personal Access Token for the `tahabasri` publisher
   # (vsce login tahabasri, or VSCE_PAT env var)
   ```

7. **Also publish to Open VSX (for Cursor, Windsurf, VSCodium, and other non-Marketplace editors).** Cursor and Windsurf cannot install from the VS Code Marketplace, so they resolve extensions through the [Open VSX registry](https://open-vsx.org) instead. Publish the **same `.vsix`/version** there with [`ovsx`](https://github.com/eclipse/openvsx/blob/master/cli/README.md) (also not a project dependency; run via `npx` or a global install). Do this right after the Marketplace publish so both registries stay on the same version:

   ```bash
   # one-time setup: create the `tahabasri` namespace on Open VSX (only needed once, ever)
   npx ovsx create-namespace tahabasri -p $OVSX_PAT

   npx @vscode/vsce package                # produces snippets-X.Y.Z.vsix (reuse the same artifact)
   npx ovsx publish snippets-X.Y.Z.vsix -p $OVSX_PAT   # publish the prebuilt .vsix to Open VSX
   # or, to let ovsx build then publish in one step: npx ovsx publish -p $OVSX_PAT
   ```

   - Open VSX auth uses its **own** access token (`OVSX_PAT` / `-p <token>`), **not** the Marketplace `VSCE_PAT`. Generate it from your Open VSX account ([open-vsx.org](https://open-vsx.org) → Settings → Access Tokens) after signing the Eclipse Publisher Agreement once.
   - Publishing the prebuilt `.vsix` (rather than `ovsx publish` with no file) guarantees the Marketplace and Open VSX ship byte-identical builds for the release.
   - The `version` published must match `package.json` — Open VSX, like the Marketplace, rejects re-publishing an existing version.

8. **Tag the released commit.** Tags are **bare `X.Y.Z`** (no `v` prefix — e.g. `3.1.0`, not `v3.1.0`) and point at the merged release commit on `main`. Create the tag from the same clean checkout used to publish, so the tag matches exactly what shipped to the registries:

   ```bash
   git checkout main && git pull          # be on the merged release commit
   git tag X.Y.Z                          # annotated not required; match existing bare-version tags
   git push origin X.Y.Z                  # push the single tag (or: git push origin --tags)
   ```

   - The tag name must equal `package.json` `version` — keep it in lockstep with the other version touch-points.
   - Tag **after** the release PR is merged so the tag lands on `main`, not on the `release/X.Y.Z` branch.

9. **Create the GitHub release.** Publish a release on the [Releases page](https://github.com/tahabasri/snippets/releases) for the tag you just pushed. The convention: the release **targets the `X.Y.Z` tag**, the title is **`Snippets X.Y.Z`** (note the `Snippets ` prefix — the tag itself stays bare), and the body mirrors that version's `CHANGELOG.md` section. Mark it as **latest**. Either use the GitHub web UI or the `gh` CLI:

   ```bash
   gh release create X.Y.Z \
     --title "Snippets X.Y.Z" \
     --notes-file <(sed -n '/^### X.Y.Z/,/^### /p' CHANGELOG.md) \
     --latest
   # or pass --notes "..." inline, or omit --notes to edit in the browser
   ```

   - Do this after publishing to the Marketplace and Open VSX so the GitHub release reflects an already-shipped version.
   - Keep the release notes consistent with the `CHANGELOG.md` entry (same PR references) so users see the same changelog across GitHub and the "What's New" webview.

> Keep both registries in lockstep: every Marketplace release should be mirrored to Open VSX with the same version, or Cursor/Windsurf users will lag behind VS Code users.

> Keep the version touch-points in lockstep when releasing: `package.json` `version`, the `changelogVersion` constant, the new `CHANGELOG.md` heading, the git tag (`X.Y.Z`), and the GitHub release title (`Snippets X.Y.Z`). A mismatch either suppresses the changelog panel, ships the wrong build, or leaves the tag/release pointing at a different version than was published.

## Conventions

- kebab-case files/folders, camelCase variables/functions, PascalCase classes/interfaces (see `.github/workflows/copilot-instructions.md` for the fuller style guide).
- When adding a command: add the ID to `CommandsConsts`, write the body in `commands.ts`, register it in `activate()`, and declare it in package.json `contributes.commands` + the appropriate `menus` group with `when` clauses. Missing any of these four leaves the command non-functional or invisible.
- Migration code in `activate()` handles upgrades from the old 1.x file-based storage and shows the changelog webview once per release (`changelogVersion` constant gates this).
