# FIT — Miao 的个人 AI 团队 App（N=1）

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
