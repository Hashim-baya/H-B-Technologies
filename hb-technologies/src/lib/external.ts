export type ExternalArticle = {
  id: number | string;
  title: string;
  description?: string;
  url: string;
  published_at?: string;
  cover_image?: string | null;
  readable_publish_date?: string;
  tag_list?: string[];
  user?: { name?: string };
};

type DevToApiArticle = {
  id?: number;
  title?: string;
  description?: string;
  excerpt?: string;
  social_image_caption?: string;
  url?: string;
  published_at?: string;
  created_at?: string;
  cover_image?: string | null;
  social_image?: string | null;
  readable_publish_date?: string;
  tag_list?: string[] | string;
  tags?: string[] | string;
  user?: { name?: string };
};

function normalizeTagList(value: DevToApiArticle["tag_list"] | DevToApiArticle["tags"]) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function toExternalArticle(article: DevToApiArticle, fallbackId: string | number): ExternalArticle {
  return {
    id: article.id || article.url || article.title || fallbackId,
    title: article.title || "Untitled article",
    description:
      article.description || article.excerpt || article.social_image_caption || "",
    url: article.url || "",
    published_at: article.published_at || article.created_at || undefined,
    cover_image: article.cover_image || article.social_image || null,
    readable_publish_date: article.readable_publish_date,
    tag_list: normalizeTagList(article.tag_list ?? article.tags),
    user: article.user || {},
  };
}

export async function fetchDevToByTag(tag: string, per_page = 6): Promise<ExternalArticle[]> {
  if (!tag) return [];
  const url = `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=${per_page}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    if (!Array.isArray(json)) return [];
    return json.map((item) => toExternalArticle(item as DevToApiArticle, crypto.randomUUID()));
  } catch {
    return [];
  }
}

export async function fetchDevToArticleById(id: string | number): Promise<ExternalArticle | null> {
  if (!id) return null;

  try {
    const res = await fetch(`https://dev.to/api/articles/${encodeURIComponent(String(id))}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json: unknown = await res.json();
    if (!json || typeof json !== "object") return null;

    return toExternalArticle(json as DevToApiArticle, String(id));
  } catch {
    return null;
  }
}
