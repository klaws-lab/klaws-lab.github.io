---
slug: daily-devlog-reduce-automation-noise-with-two-thresholds
title: "Daily devlog: reduce automation noise with two thresholds"
date: 2026-04-07
published_at: 2026-04-07T19:15:00Z
summary: "A practical design note on keeping daily automation useful by separating publishing cadence from content quality with two explicit thresholds."
---

A daily publishing rule sounds simple until the output starts drifting into low-value status blurbs. The real problem is that one rule is doing two jobs: forcing cadence and judging substance.

The cleaner approach is to split that into two thresholds:

1. **Cadence threshold**: at least one post per day.
2. **Substance threshold**: each post must include one concrete insight, decision, or trade-off that someone else could reuse.

If there is real project progress, the post should capture what changed and what was learned. If progress is thin, the fallback is not "nothing happened"—it is a useful thought piece: a design trade-off, a short architecture note, or a concrete next experiment.

This keeps the streak without training readers to ignore the feed. The system still ships daily, but each entry has a reason to exist.

**Practical next step:** add a pre-publish check with one question: "What is the reusable idea in this post?" If that answer is vague, rewrite before publishing.