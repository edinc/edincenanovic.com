import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "../consts";
import { byPubDateDesc, isSyndicated } from "../lib/posts";
import { withBase } from "../lib/url";

export async function GET(context) {
  const posts = (await getCollection("blog", isSyndicated)).sort(byPubDateDesc);

  return rss({
    title: SITE.name,
    description: SITE.tagline,
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: withBase(`/blog/${post.id}/`),
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}
