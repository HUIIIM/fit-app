# Helm — Reference Operations Teardown (REA)

**Scope:** the OPERATING interface only — how a user navigates, drills down, commands, and links panels. Not visual identity, not data, not the generator.
**References:** Palantir Foundry / Gotham (the Ontology operating layer) and the Bloomberg Terminal (the command-line operating layer).
**Date:** 2026-11-11. **Branch:** `claude/helm-ops-depth-1`.
**Status:** this file leads the implementation in this slice. Code follows the mapping table in §5; where the table says "deviation", the code does that deviation deliberately and says so in the PR.

## 0. Sources and honesty note

- Bloomberg behaviour is documented in public sources, including the Bloomberg Terminal article (command syntax `{VOD LN Equity GO}`, function codes such as `{HP GO}` / `{DVD GO}` / `{CN GO}`, the yellow market-sector keys, `CANCEL` / `GO`, the `MENU` key returning to the previous function, the `History` key, four panels each running a separate terminal instance, and Launchpad components).
- Foundry behaviour is documented in Palantir's public Ontology documentation ("The Palantir Ontology is an operational layer for the organization"; objects, properties and link types; action types and functions; interfaces; Object Explorer — search, filter, "Pivot to explore linked objects", "Apply Actions"; Object Views — Properties and Links; Vertex — "Explore object relationships", "Search Around").
- Gotham's exact current screen layout is proprietary and was not directly observable in this session. Where this file describes Gotham, it describes the widely documented object-graph operating discipline (search an object, open its properties, traverse its links, expand the graph around it), labelled as such, not a pixel-level claim.
- Nothing in this file changes Helm's data. The relation audit (Step 0 of the slice) is a separate, data-feasibility gate: only relations derivable from projection v2.0 fields may be rendered as links. See §4.

## 1. What each reference system IS, operationally

### 1.1 Bloomberg Terminal — a command-line operating system

- One command line, always present. Everything is addressed, not browsed: `{security} {market} {function} GO`. A security is a typed object (`VOD LN Equity`); a function is a verb on the loaded object (`HP` = historical prices, `CN` = news on the loaded security).
- The loaded security is state. Functions act on "the currently loaded" object; loading a new security re-targets every function. There is no separate "detail page" — the function IS the view of the object.
- Four panels, each a separate terminal instance. Panels are independent command lines that can show different functions of the same loaded security, or different securities. That is panel linkage: panels share the loaded object, not the screen.
- Launchpad: a board of components, each permanently displaying one set of data (news ticker, inbox, monitor). Components are pinned views, not pages.
- Density is the product: small type, tight rows, tabular numbers, no decoration, every row a number or a link. The screen is a desk, not a page.

### 1.2 Palantir Foundry — an Ontology operating layer

- The world is objects with properties, typed links to other objects, and actions. The Ontology "sits on top of the digital assets" and "connects them to their real-world counterparts". An object type is defined once; every instance carries the same property and link shape.
- Object Explorer is the drill-down surface: search for objects, filter the set, open one object, and **pivot to explore linked objects** — the link is the navigation. A linked object opens in the same explorer; its own links are then available, so drill-down is unbounded in depth.
- Object Views separate an object into Properties and Links. The Links tab is a first-class surface, grouped by link type, with a count per link type. A link with no instances is shown as empty, never as an invented link.
- Vertex is the graph surface: start from objects, "search around" them (expand one hop along a link type), and keep expanding. The graph is the navigation history made visible.
- Actions are typed operations on objects ("Apply Actions"), parameterised by the object, with permission and audit. A read-only drill-down never becomes an action by accident.
- Human + AI: the Ontology is described as the "central system for orchestrating decisions across human + AI teams". The operator stays in the loop; the system proposes, the operator navigates and decides.

### 1.3 Palantir Gotham — an object-graph investigation surface

- Gotham's documented discipline: an analyst starts from a known object (person, place, event, document), opens its properties, follows its links to neighbouring objects, and expands the graph hop by hop, keeping the path visible so the investigation can be retraced and challenged.
- Every hop is explicit and reversible. A link that does not exist is not drawn. The graph is evidence, so a missing link is information, not a gap to be papered over with a guessed connection.
- Search is object search: the result is an object, and selecting it opens that object — not a document, not a dashboard.
- Search is object search: the result is an object, and selecting it opens that object — not a document, not a dashboard.

## 2. The operating discipline, distilled (the rules we copy)

1. **Address, don't browse.** Every object has a stable address (type + id). The command surface takes an address and opens the object directly.
2. **The object is the page.** A detail view is: identity, properties, status/source, then links grouped by link type with counts. Nothing else competes with it.
3. **Links are the navigation.** Every linked object is clickable, and clicking it replaces the focus with that object. Depth is unlimited; the path is the history.
4. **History is a visible path.** The user can always see where they are in the path, step back one hop, or jump to any earlier hop. Back is one key.
5. **Panels follow the focus.** Selecting an object in one panel re-targets the linked panels to that object. Panels never show different objects without saying so.
6. **Search returns objects.** A search result is an object; selecting it opens the object. Search never returns a page.
7. **Keyboard first, mouse second.** `/` or `Ctrl/⌘K` opens the command surface; `↑`/`↓` move; `Enter` runs; `Esc` cancels / steps back; a history key replays previous commands in reverse order.
8. **Density is discipline.** Rows are tight, tabular, and countable. Every list row shows its link count. No row is decoration.
9. **Empty is a fact.** A link type with zero instances is shown as zero / "none in this snapshot" — never hidden, never invented.
10. **No action without an object.** Commands that change state are parameterised by a loaded object and are visibly distinct from navigation. (Helm has no write actions in this slice; the rule is kept by making every navigation read-only.)

## 3. Helm before this slice (baseline, for the mapping)

- Phone: five stacked views (Briefing, Goals, Chat, Team, Settings) with a bottom tab bar; rows are mostly not clickable.
- Desktop (≥1024px) Wall: panels B1–B8 in a fixed grid; a focus object (`wallFocusRef`) drives the detail panel B7; selecting a wall item sets the focus, and panel B7 shows the focus object's linked activity.
- Search overlay: full-text results grouped by kind; selecting a result opens the *view* that contains it (e.g. Goals), not the object itself.
- Command palette (`/` or `Ctrl/⌘K` on the Wall): navigation commands only ("Go to …", "Load …", "Toggle …"); no objects, no history replay.
- No breadcrumb, no back stack, no per-object link counts on rows.

## 4. Data feasibility gate (relation audit — summary)

Full audit table and generator gap list are in the PR description for this slice. The binding conclusions for the mapping below:

- Derivable, all from `subject_ref` (the only object-to-object field in projection v2.0): Goal ↔ Activity, Goal ↔ Decision, Goal ↔ Approval (each in both directions, by equality with `goal.id`).
- Not derivable, therefore not rendered as links: anything involving a Seat (no seat objects exist in projection v2.0 — `team` is counts only); Brief item → anything (the briefing carries no id and no `subject_ref`); Decision/Approval → Activity (no cross-reference, and title equality is not a link); any relation whose only evidence is a matching title or date.
- Activity items have no stable id in the projection; their address in this slice is their position in `recent_activity` (`activity-<index>`). That is a *local* address for navigation only, not a data claim.

## 5. Mapping table — reference behaviour → Helm implementation → deviation

| # | Reference behaviour | Helm implementation in this slice | Deviation, and why |
|---|---|---|---|
| R1 | Bloomberg: every object is addressed as `{type} {id}` on a command line; `GO` opens it. | Command palette (`/` / `Ctrl+⌘K`) gains object entries: typing a goal/decision/approval/activity/brief title matches the object itself, and `Enter` opens that object's detail directly. Search results do the same. | No free-text command grammar (`GOAL-1 HP GO`) is implemented: Helm objects have no function codes and no typed command language in the projection. The palette is a fuzzy object matcher, not a Bloomberg command parser. That grammar is a generator/product decision, not a client one. |
| R2 | Bloomberg: functions act on "the currently loaded" security; loading a new security re-targets every function. | A single **focus object** (`wallFocusRef` on the Wall, the detail stack on phone) is the loaded object. Opening a related object re-targets the detail panel and the linked panels to it. | Helm's focus is one object at a time, not one per panel. The Wall's four-panel independence is not reproduced: Helm has one focus, shared by all panels. Reproducing per-panel focus would need a panel-state model the single-file app does not have; the shared focus is the Foundry-style single-object focus, and it preserves the existing Wall contract. |
| R3 | Foundry Object Explorer: pivot to linked objects; drill-down is unbounded in depth. | Every detail view gains a **Related objects** section, grouped by type, with a count per group; every entry opens that object. Detail → related → detail works for ≥3 consecutive hops on the bundled fixtures (verified chain: Goal-1 → Approval appr-1 → Goal-1 → Decision dec-44 → Goal-1 → Activity). | Depth is unbounded in the UI, but the *graph* is only as deep as `subject_ref` allows: every hop returns to a Goal, because Goals are the only objects that link onward. That star shape is a property of the data (see §4), not of the UI; the UI does not invent cross-links to make the graph look richer. |
| R4 | Gotham / Vertex: the investigation path is visible; every hop is explicit and reversible. | A **breadcrumb path bar** (type + title per hop, `›` separated, each hop clickable) plus a **Back** button, on the detail surface at both widths. Navigation history lives in memory only and resets on refresh. | No graph canvas: Helm renders the path as a linear breadcrumb, not a node-link graph. A graph view needs layout, pan/zoom and edge rendering the single-file PWA does not have; the breadcrumb is the linear trace of the same path, which is the information the acceptance test needs. |
| R5 | Bloomberg `MENU`: back to the previous function; `History`: previous functions in reverse chronological order. | `Esc` closes the detail / steps back one hop; `Back` steps back one hop; palette history is the breadcrumb path itself (click any hop). | No separate `History` key replaying typed commands: the palette had no command history to replay, and the breadcrumb already is the history of *objects*. A command-history key is deferred until the command surface has a grammar (R1). |
| R6 | Foundry Object Views: Properties and Links are separate tabs; Links grouped by link type with counts. | Detail view keeps the existing status/source lines (Properties), then a **Related objects** section grouped by type, each group headed with its count. A group with zero instances is not rendered as a group; the empty state is stated once ("No related objects for this item in this snapshot"). | Properties and Links are stacked in one scroll, not tabbed. Tabs would add a second navigation layer inside a detail that is itself a panel; the frozen panel order and the single-scroll phone layout argue for a stacked section, and the acceptance test is drill-down, not tabbing. |
| R7 | Bloomberg Launchpad: components permanently displaying one dataset; panels follow the loaded object. | Wall panels B1–B8 stay in their fixed order and keep their data. Selecting an object in any panel re-targets the detail panel (B7) and marks the selection in its home panel. On phone, the same selection opens the detail surface. | Panels do not each become an independent terminal instance (see R2). Launchpad-style pinning of a component to a fixed object is not implemented: pinning is a persistence/preference feature, and this slice keeps navigation history in memory only by design. |
| R8 | Bloomberg: search is the command line; a result opens the security/function, never a page. | Search overlay: result composition, grouping and text are unchanged; only the open target changes — selecting an object result opens that object's detail directly, instead of the view that contains it. Non-object results (views, settings) keep their existing target. | The search box is not a Bloomberg command line: it has no `{id} {function} GO` grammar and no sector keys. It is full-text object search, which is the Foundry Object Explorer model. The Bloomberg grammar is the R1 deviation. |
| R9 | Both references: density discipline — tight rows, tabular numbers, link counts on every row. | Panel rows thicken within the frozen design system (`.act-row` 28→36px, `.wall-item` min-height 28→36px, `.row-line` padding 8→10px); every object row gains a related-object count (goal row: activity count; seat row: approvals count — 0, honestly; approval/decision/activity rows: their related count). Design tokens, the five data forms, orange usage (signal-disc core + pending capsule only), and panel block order are unchanged. | Helm's rows are thicker than Bloomberg's by design: the frozen visual spec (accepted, phone-first, 15px base) forbids Bloomberg's ~12px terminal density. Density is applied as "thicker, countable rows", not "more rows per screen". |
| R10 | Foundry: an empty link is shown as empty, never invented; Gotham: a missing link is information. | Related sections and row counts show 0 / "none in this snapshot" where the audit says a relation is not derivable. No title-matching, no date-matching, no proposer-name matching is used to create links. | — (no deviation; this rule is followed exactly, and it is why the graph is star-shaped — see R3). |
| R11 | Foundry: actions are typed, parameterised by the loaded object, visibly distinct from navigation. | No write actions are added in this slice. Navigation is read-only; the pending-approval detail keeps its existing status/proposer/effect lines and does not gain an approve/reject action. | Approving/rejecting from the detail would be the Foundry-style action; it is out of scope for this operation-layer slice and would need a write path the snapshot projection does not define. Noted for a later slice. |
| R12 | Bloomberg: `CANCEL` (Esc, red) stops a task; `GO` (Enter, green) runs it. | `Esc` cancels/steps back; `Enter` runs the selected palette/search/detail entry. | Colour rule is a hard Helm deviation by design: no red/green keys. Esc/Enter are uncoloured text keys in Helm's ink-on-paper DNA (orange only at the signal-disc core and the pending capsule). The *behaviour* (Esc = cancel/back, Enter = run) is copied; the *colour* is not. |
| R13 | Both references: a single, stable layout — the operator learns where everything lives and it does not move. | No panel is moved, reordered, or restyled. The detail surface is a new overlay/panel surface that sits *over* the existing layout; the breadcrumb lives inside it. Phone and desktop share the same detail renderer and the same history stack. | The detail is an overlay on phone and a panel + overlay on desktop, not a permanent new panel in the Wall grid. Adding a ninth Wall panel would change the accepted grid; the overlay keeps the grid frozen while giving both widths the same drill-down. |

## 6. What "1:1" means here, precisely

- **Operating discipline 1:1:** address → object → properties → links → next object; visible path; back in one step; search returns objects; keyboard-first; empty links shown as empty. That is the fidelity target, and the mapping table is the test for it.
- **Not 1:1, by explicit decision:** Bloomberg's command grammar and colour-coded keys, Foundry's graph canvas and tabbed Object Views, per-panel independent focus, and any write action. Each is listed above with its reason. None of these is silently dropped.
- **Visual identity is not the fidelity target:** ink black / paper white / grays ≥95%, signal orange `#FF4713` only at the signal-disc core and the pending capsule, no blue, no cyan. The references are rendered in Helm's palette, not theirs.

## 7. Verification for this slice

- Three-hop drill-down on the bundled fixtures, both widths, zero page errors (acceptance live test). Verified chain on `tests/fixtures/snapshot.vnext-desktop.json` (generation 44): Goal `goal-1` → Approval `appr-1` → Goal `goal-1` → Decision `dec-44` → Goal `goal-1` → Activity `activity-0`. Each hop is a click on a Related-objects entry; each intermediate detail shows its own Related objects; Back / breadcrumb returns hop by hop.
- Extracted inline script passes a syntax parse check (stated in the PR).
- Service worker version bumped in both places it is declared (v10 → v11) and README/field notes synced where they describe navigation.
- Case-related source filtering in the data pipeline is untouched.

## 8. Open items (generator / product, not this slice)

- From the relation audit: emit `subject_ref` on every approval, decision and activity; give activity items a stable id; give the briefing an id and a `subject_ref`; add a `seats[]` array if Seat is to become an object.
- Command grammar (`{object} {function} GO`) and a `History` key — product decisions for a later slice (R1, R5).
- A graph (Vertex-style) view and tabbed Object Views (R4, R6) — later slice.
- Typed write actions on approvals (R11) — needs a write path.
