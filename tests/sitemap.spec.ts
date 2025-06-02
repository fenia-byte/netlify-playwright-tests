import { test, expect } from "@playwright/test";
import { getSitemapUrls } from "../utils/sitemapUtils";

test.describe("Sitemap and Crawlability", () => {
  const baseUrl = "https://www.netlify.com";
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const maxUrlsToCheck = 5; // Reduced to prevent timeouts

  test("sitemap.xml exists and is valid XML", async ({ request }) => {
    const response = await request.get(sitemapUrl);
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/xml/i);

    const body = await response.text();
    expect(body).toContain("<?xml");
    expect(body).toContain("<urlset");
  });

  test("important pages are included in sitemap", async () => {
    const urls = await getSitemapUrls(sitemapUrl);
    const importantPaths = [
      "/",
      "/products",
      "/pricing",
      "/enterprise",
      "/contact",
    ];

    for (const path of importantPaths) {
      const fullUrl = `${baseUrl}${path}`;
      const found = urls.some((url) =>
        url.toLowerCase().startsWith(fullUrl.toLowerCase()),
      );
      expect(
        found,
        `Important page ${fullUrl} not found in sitemap`,
      ).toBeTruthy();
    }
  });

  test("sample of sitemap URLs are accessible", async ({ page }) => {
    const urls = await getSitemapUrls(sitemapUrl);
    const sampleUrls = urls.slice(0, maxUrlsToCheck);
    const issues: { url: string; issue: string }[] = [];

    // Increase timeouts for navigation
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    for (const url of sampleUrls) {
      try {
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        if (!response) {
          issues.push({ url, issue: "No response received" });
          continue;
        }

        if (response.status() === 404) {
          issues.push({ url, issue: "404 Not Found" });
          continue;
        }

        if (response.status() !== 200) {
          issues.push({
            url,
            issue: `Unexpected status: ${response.status()}`,
          });
          continue;
        }

        // Basic SEO checks
        const title = await page.title();
        if (!title) {
          issues.push({ url, issue: "Missing page title" });
        }

        const metaDescription = await page
          .locator('meta[name="description"]')
          .first();
        if (!(await metaDescription.count())) {
          issues.push({ url, issue: "Missing meta description" });
        }
      } catch (error) {
        issues.push({ url, issue: `Error: ${error.message}` });
      }
    }

    // Report issues
    if (issues.length > 0) {
      console.log("Found issues:", JSON.stringify(issues, null, 2));
    }
    expect(issues).toHaveLength(0);
  });
});