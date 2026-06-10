# Authoring content

How to add posts and edit the site's copy. No database, no CMS — everything is
files in Git.

## Add a blog post

1. Create `src/content/blog/my-post.md` (the filename becomes the URL slug).
2. Add front matter:
   ```md
   ---
   title: "My post title"
   description: "One-line summary for cards, SEO and RSS."
   pubDate: 2026-06-10
   tags: ["devops", "astro"]
   draft: false
   ---

   Your Markdown content here.
   ```
3. `npm run dev` to preview. Set `draft: true` to keep it out of production
   builds. That's the entire workflow.

The front matter is validated by a Zod schema in
[`src/content.config.ts`](../src/content.config.ts), so the build fails fast on a
missing or mistyped field.

> **The blog is currently hidden.** `FEATURES.blog` in
> [`src/consts.ts`](../src/consts.ts) is `false`, which hides the blog everywhere
> (nav link, the home "latest posts" section, `/blog`, `/blog/<slug>`, the RSS
> feed, and the sitemap). Flip it to `true` to surface the blog — posts you add
> now will appear automatically once it's enabled.

## Change site content

All copy — name, role, bio, social links, nav, and site metadata — lives in
[`src/consts.ts`](../src/consts.ts). Edit that one file; components stay
presentational.

Design tokens (colors, spacing, widths) are CSS custom properties in
[`src/styles/global.css`](../src/styles/global.css). Reuse the tokens rather than
introducing one-off values.
