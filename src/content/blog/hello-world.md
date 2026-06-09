---
title: "Hello, world"
description: "Why I rebuilt my personal site from scratch as a fast, terminal-themed static site — and how it works under the hood."
pubDate: 2026-06-09
tags: ["meta", "astro", "open-source"]
---

This is the first post on the new edincenanovic.com. The site you're reading is a
hand-authored, terminal-themed static site — no WordPress, no database, just
Markdown in Git.

## Why a terminal theme?

I spend most of my day in a shell. A terminal aesthetic feels like home, and it
keeps the focus where it belongs: on the words. The "terminal" look here is
**purely visual** — there's no fake REPL or typed commands, just clean, static
HTML styled to evoke a prompt.

## How it's built

- **Astro** generates static HTML and ships almost zero JavaScript by default.
- **Plain CSS** with design tokens powers the dark/light themes — no framework.
- **Markdown content collections** mean adding a post is just dropping a file
  in `src/content/blog/`.

```bash
# adding a new post is this simple:
$ touch src/content/blog/my-new-post.md
$ $EDITOR src/content/blog/my-new-post.md
```

```ts
// front matter is type-checked via a Zod schema
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});
```

## What's next

More writing on DevOps, developer productivity, open source, and cloud-native
work. Thanks for stopping by.
