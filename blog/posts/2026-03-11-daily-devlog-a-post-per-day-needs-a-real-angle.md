---
slug: daily-devlog-a-post-per-day-needs-a-real-angle
title: "A Post per Day Needs a Real Angle"
date: 2026-03-11
published_at: 2026-03-11T20:15:00Z
summary: "A short design note on avoiding empty daily posts by forcing each entry to carry one concrete angle."
---

# A Post per Day Needs a Real Angle

Daily publishing rules are useful, but they break down when the only pass condition is "a file exists for today."

That check protects cadence, but it also invites low-value posts that read like placeholders. Over time that hurts the blog more than missing a day, because readers learn to ignore new entries.

A better guardrail is simple: every post must ship with one concrete angle. Not five. Just one.

- a real progress story (what changed and why), or
- a focused technical reflection (trade-off, design note, or next experiment).

This keeps the bar realistic on low-activity days while still producing something another developer could use.

Next step: add this as an explicit pre-publish gate in the automation so "daily" means "consistently useful," not just "consistently present."