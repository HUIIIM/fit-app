# Helm — Miao 的个人 AI 团队 App（N=1）

董事长 2026-10-06 原令：做一个真实的 app，电脑、手机都能运行；先把 app 壳子、AI 智能体、架子全搭起来，没有功能的用静态模拟。无合约前置（董事长明示签不了合约，按本 chat 指令授权推进）。

## 登记与验收
- 登记：跟踪项 goal_c6b9c5d42ad3（FIT app 骨架部署与验收）；本文件为该项标准载体（需求＋红线＋状态日志）。
- 主人：个人侧聊席 58f79828（J.A.R.V.I.S.）。
- 验收定义：部署 URL 在董事长手机打开成功＋本席 curl 回读 200＋五视图可点，缺一不算完成；骨架阶段已验项＝本地三件套 200（2026-11-03）。

## 形态
- PWA：手机可安装到主屏、电脑浏览器可直接打开；离线可开壳（service worker 缓存）。
- 语音优先：晨间简报为首页，目标交互＝听简报＋拇指点按（确认／修改／否决）。
- 五个视图：简报（昨夜进展＋等你决定）、日程（四象限＋时间块）、团队（六角色：总管家 PM／工程师／秘书／研究员／生活教练／财务官）、对话（团队消息流）、我的（周复盘＋授权规则）。

## 状态日志（只记回读实证，不记自报）
- 2026-11-03：此前会话报告的 museflex-mobile 仓库、fleet-registry 服务、部署文档经三路核验（本机磁盘／GitHub 搜索／记忆库）均不存在，判定为未落地的自报，已作废。FIT 于本日从零在本目录重建骨架：index.html（五视图＋模拟数据）、manifest.webmanifest、sw.js 落盘。
- 待办：① 部署到可公开打开的 URL（Vercel 静态托管）；② 简报接真实数据源（目标/台账读数）；③ 六角色逐个接真实能力；④ 语音晨报接 TTS。

## 红线
- 只服务 Miao 本人（N=1），产品化是远期事项，未经他明示不开工。
- 汇报只认回读实证：文件在盘、构建通过、URL 可打开，三者缺一不报「完成」。

## Slice 2 — snapshot client, Company sections and global search (2026-11-10)

- Profile view holds an optional snapshot URL (localStorage `fit.snapshot.url`; empty = local-only, no network call). The client fetches it once per load with `cache:'no-store'`, stores the last-good snapshot plus fetched-at time in `fit.snapshot.cache.v1`, and on failure/offline renders the cache with an age label ("snapshot · 2h ago"). The UI never blocks on the fetch.
- Briefing view gains a Company section (only when a snapshot is present): latest briefing entry, goals summary (total + named entries, count-only remainder as "N more items"), recent decisions (up to 5), and — when present — `snapshot.overview`: an overview strip (goals total + named, activity buckets, staleness) and a recent-activity list (up to 10). Entries without a display title render as count-only / type+date lines; no names are invented.
- Team view gains a Company snapshot block with workspace/goal counts when present.
- Global search (header icon, top of Briefing) searches local schedule items, local journal messages and snapshot content as rendered (display titles, decision ids, recent-activity display titles). Results navigate to the relevant view; empty-query and no-result states are shown honestly.
- Exposure rule: the client reads only pre-sanitized display titles from the snapshot — see the field list in the `cleanSnapshot` comment in `index.html` — and never reads any other title/slug field. Palette stays ink/orange; no analytics, no accounts, no other network calls. A sample snapshot is in `tests/fixtures/snapshot.sample.json`.
- Manual checklist: configure the fixture URL → Company/Team sections appear; reload offline → cached sections with age label; clear the URL → back to local-only; search "Ship FIT snapshot client", a schedule title and a journal word → hits across all three sources; search a nonsense string → honest no-result state.

## Helm rename and overview skeleton (G8 v2) (2026-11-10)

- Rename (user-visible only): manifest `name`/`short_name` are "Helm", description is "Helm — AI company console: morning briefing, decisions and approvals"; `index.html` title is "Helm · 我的 AI 团队", the clear-data text now says Helm data, and the head links the apple-touch icon (`icons/icon-180.png`) and the SVG icon (`icons/icon.svg`). Manifest icons: 192 any, 512 any maskable. Internal storage keys are unchanged (`fit.state.v1`, `fit.snapshot.url`, `fit.snapshot.cache.v1`), so user data survives; the repo name and URLs are unchanged.
- Briefing view is now the Helm overview (phone cockpit, G8 v2): Block 0 status bar — snapshot state (local-only / live / cached / stale / not-connected), a five-state signal disc (grayscale conic fill, orange core), age label, Generation #N when `generation_seq` is present, projection version, and a Shell v4 label. Block 1 goals overview — total + named count + activity buckets (24h / 7d / older) + staleness, with grayscale count bars. Block 2 activity stream — up to 10, display_title or type+date honest form. Block 3 briefing/decisions lines as in Slice 2. Block 4 pending approvals — `not_connected` renders an explicit "not connected" state (never a fake 0); items render count + cards, with proposer/effect lines only when those fields are present. Block 5 health line — `fleet_health` counts when present, otherwise a source-gap note. Drill-down stays the five existing views (two levels max); the goals block links to Team.
- Orange #FF4713 in the overview appears only on the pending-approvals badge (count > 0) and the signal-disc core. Palette: #000000 ink, #FFFFFF, #F5F5F5, #E5E5E5, #737373, #FF4713, #1D8348.
- Contract v-next dual-read: `cleanSnapshot` reads `projection_version` (preferred over legacy `version`), `generation_seq`, `subject_ref` on activity/decision/approval items (shown where present, no dead UI), and ignores `tenant` entirely. Absence of any v-next field does not break rendering; the current snapshot shape still renders as before. New fixtures: `tests/fixtures/snapshot.vnext.json` (projection_version 2 vs legacy version 1, generation_seq 42, subject_ref on activity/decision, pending_approvals not_connected, a tenant that must not be displayed, fleet_health healthy 2 / degraded 1 / down 0) and `tests/fixtures/snapshot.vnext-approvals.json` (pending_approvals connected, count 2; one item with proposer "Finance" and effect "Budget +$100", one without proposer/effect).
- Service worker: `helm-shell-v4`, a version-derived cache (`SW_VERSION` 'v4' in `sw.js`, `SHELL_VERSION` 'v4' in `index.html`), skipWaiting + clients.claim, icons cached with the shell. Already-open pages reload once to the new shell on controllerchange, guarded by sessionStorage `helm.sw.reloaded.v4` (and only when a controller already existed, so first install does not reload); an old shell survives only as an already-open labeled session (Shell v4 is shown in the overview status bar and in My data).
- Locale: new overview strings go through `const STR = { 'zh-CN': {...}, en: {...} }` in `index.html`, zh-CN default (en when the browser language starts with en), structured for later slices to extend. Existing views were not retrofitted.
- Manual checklist (code inspection against the fixtures; all three fixture files were validated by loading them in the deployed app, each reporting "Snapshot loaded", then clearing the URL back to local-only): sample fixture → overview shows "Ship FIT snapshot client", goals total 30 / named 1, buckets 0 / 0 / 30, staleness 28, 2 titled activity entries, briefing and decisions dec-1/dec-2, health source-gap note, pending-approvals no-data note. V-next fixture → Generation #42, Projection 2 (not legacy version 1), subject_ref "goal-1" shown on activity/decision, pending approvals "not connected" (not 0), fleet_health healthy 2 · degraded 1 · down 0, tenant name never shown, and the count-only activity entry renders as type+date. V-next-approvals fixture → orange badge "2", card "Increase Helm budget" with Proposer: Finance / Effect: Budget +$100, and card "Ship Helm overview" with no proposer/effect lines. Local-only (no URL) → overview shows local-only status and gap notes, no fake data; the five views still navigate; local schedule/journal are unchanged.
- Open item: live run on a phone after merge, as before — the live-run item stays open for post-merge.
