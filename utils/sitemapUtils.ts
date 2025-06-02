import { XMLParser } from "fast-xml-parser";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

interface SitemapData {
  urlset: {
    url: SitemapUrl[] | SitemapUrl;
  };
}

export class SitemapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SitemapError";
  }
}

export async function getSitemapUrls(sitemapUrl: string): Promise<string[]> {
  try {
    const response = await fetch(sitemapUrl);

    if (!response.ok) {
      throw new SitemapError(
        `Failed to fetch sitemap: ${response.status} ${response.statusText}`,
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("xml")) {
      throw new SitemapError(`Invalid content type: ${contentType}`);
    }

    const xml = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
    });

    const data = parser.parse(xml) as SitemapData;

    if (!data.urlset || !data.urlset.url) {
      throw new SitemapError(
        "Invalid sitemap format: missing urlset or url entries",
      );
    }

    // Handle both single URL and array of URLs
    const urlEntries = Array.isArray(data.urlset.url)
      ? data.urlset.url
      : [data.urlset.url];
    return urlEntries.map((entry) => entry.loc);
  } catch (error) {
    if (error instanceof SitemapError) {
      throw error;
    }
    throw new SitemapError(`Failed to parse sitemap: ${error.message}`);
  }
}

export async function validateSitemapUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

export function isValidSitemapUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
