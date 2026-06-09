---
title: "Leaving WordPress behind"
description: "Moving a personal site off WordPress to a Git-based static workflow: what I gained, what I gave up, and why it fits a DevOps mindset."
pubDate: 2026-06-02
tags: ["devops", "static-site", "migration"]
---

For years my site ran on WordPress. It worked — but it was more machinery than I
needed for a bio page and the occasional post. So I moved to a static site
deployed from Git. Here's the reasoning.

## What I gained

- **Speed.** Pre-rendered HTML on a CDN is hard to beat. No PHP, no database
  round-trips, no plugin bloat.
- **A Git workflow.** Content lives in version control. Changes are pull
  requests; deploys are pushes to `main`. That fits how I already work.
- **Security & maintenance.** No admin panel to patch, no plugins to update, no
  attack surface beyond static files.

> The best part: the whole site is just text files I can grep, diff, and
> back up anywhere.

## What I gave up

A GUI editor and one-click plugins. In exchange I write Markdown and own every
line of the theme. For a developer, that's a good trade.

## The shape of the migration

1. Re-author the presentation page by hand (it was a bio plus four links).
2. Stand the new site up locally and iterate on the design.
3. Wire up CI/CD and cut DNS over once everything checks out.

If you live in a terminal and think in pipelines, a static site just *fits*.
