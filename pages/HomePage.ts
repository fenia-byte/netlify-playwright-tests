import { Page, Locator, expect } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly newsletterForm: Locator;

  constructor(page: Page) {
    this.page = page;
    // Fixed selectors based on actual page structure
    this.newsletterForm = page.locator('form:has(input[type="email"])').first();
    this.emailInput = page.locator('input[type="email"]').first();
    this.submitButton = page
      .locator('input[type="submit"], button[type="submit"]')
      .first();
    this.successMessage = page.locator("text=/thank|success|subscribed/i");
    this.errorMessage = page.locator(
      ".error-message, .form-error, [data-error]",
    );
  }

  async goto() {
    try {
      await this.page.goto("https://www.netlify.com/", {
        waitUntil: "domcontentloaded",
      });
      // Wait for the form to be ready instead of waiting for network idle
      await this.waitForFormReady();
    } catch (error) {
      console.error("Error loading page:", error.message);
      throw error;
    }
  }

  async waitForFormReady() {
    try {
      await this.emailInput.waitFor({ state: "visible", timeout: 15000 });
      const isVisible = await this.isFormVisible();
      return isVisible;
    } catch (error) {
      return false;
    }
  }

  async fillForm(email: string) {
    const isReady = await this.waitForFormReady();
    if (!isReady) {
      throw new Error("Form is not ready or visible");
    }

    await this.emailInput.fill(email);

    try {
      await this.submitButton.click({ timeout: 5000 });
      await Promise.race([
        this.successMessage.waitFor({ state: "visible", timeout: 5000 }),
        this.errorMessage.waitFor({ state: "visible", timeout: 5000 }),
      ]).catch(() => {});
    } catch (error) {
      throw error;
    }
  }

  async isFormVisible() {
    const emailVisible = await this.emailInput.isVisible();
    const submitVisible = await this.submitButton.isVisible();
    return emailVisible && submitVisible;
  }

  async getFormValidationState(): Promise<{
    isValid: boolean;
    message?: string;
  }> {
    try {
      await this.page.waitForTimeout(1000);

      const errorVisible = await this.errorMessage
        .isVisible()
        .catch(() => false);
      if (errorVisible) {
        const message =
          (await this.errorMessage.textContent()) || "Invalid email";
        return { isValid: false, message };
      }

      const successVisible = await this.successMessage
        .isVisible()
        .catch(() => false);
      if (successVisible) {
        return { isValid: true };
      }

      const isValid = await this.emailInput.evaluate((el: HTMLInputElement) =>
        el.checkValidity(),
      );
      return { isValid };
    } catch (error) {
      return {
        isValid: false,
        message: "Could not determine validation state",
      };
    }
  }
}
