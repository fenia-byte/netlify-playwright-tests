import { test, expect } from "@playwright/test";
import { getSitemapUrls } from "../utils/sitemapUtils";

test.describe("404 Link Verification", () => {
  const baseUrl = "https://www.netlify.com";
  const maxPagesToCheck = 3; // Reduced to prevent timeouts
  const maxLinksPerPage = 10; // Limit links to check per page

  test("verify sample of links are not broken", async ({ page }) => {
    // Increase timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    const sitemapUrls = await getSitemapUrls(`${baseUrl}/sitemap.xml`);
    const checkedUrls = new Set<string>();
    const brokenLinks: { page: string; link: string; status?: number }[] = [];

    // Check first N pages from sitemap
    for (const pageUrl of sitemapUrls.slice(0, maxPagesToCheck)) {
      try {
        console.log(`Checking links on page: ${pageUrl}`);

        const response = await page.goto(pageUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        if (!response) {
          console.log(`Failed to load page: ${pageUrl}`);
          continue;
        }

        // Get all links on the page
        const links = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("a[href]"))
            .map((a) => a.getAttribute("href"))
            .filter(
              (href) =>
                href &&
                !href.startsWith("#") &&
                !href.startsWith("mailto:") &&
                !href.startsWith("tel:") &&
                !href.startsWith("javascript:")
            )
            .slice(0, 10); // Limit to first 10 links
        });

        // Check each unique link
        for (const link of links.slice(0, maxLinksPerPage)) {
          if (!link) continue;

          const absoluteUrl = link.startsWith("http")
            ? link
            : new URL(link, baseUrl).toString();

          // Skip if already checked or external
          if (checkedUrls.has(absoluteUrl) || !absoluteUrl.includes(baseUrl))
            continue;
          checkedUrls.add(absoluteUrl);

          try {
            const response = await page.context().request.head(absoluteUrl, {
              timeout: 10000,
            });

            if (response.status() === 404) {
              brokenLinks.push({
                page: pageUrl,
                link: absoluteUrl,
                status: response.status(),
              });
            }
          } catch (error) {
            console.log(`Error checking link ${absoluteUrl}:`, error.message);
            brokenLinks.push({
              page: pageUrl,
              link: absoluteUrl,
              status: 0,
            });
          }
        }
      } catch (error) {
        console.log(`Error processing page ${pageUrl}:`, error.message);
      }
    }

    // Report findings
    if (brokenLinks.length > 0) {
      console.log("Found broken links:", JSON.stringify(brokenLinks, null, 2));
    }

    expect(
      brokenLinks,
      `Found ${brokenLinks.length} broken links. Check test output for details.`
    ).toHaveLength(0);
  });
});
