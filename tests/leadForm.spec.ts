import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { testData } from "../utils/formUtils";

test.describe("Lead Capture Form Validation", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test("newsletter form is present and visible on homepage", async () => {
    const isFormVisible = await homePage.waitForFormReady();
    expect(isFormVisible, "Newsletter form should be visible").toBe(true);
  });

  test("email input has proper attributes", async () => {
    await homePage.waitForFormReady();
    await expect(homePage.emailInput).toHaveAttribute("type", "email");
    await expect(homePage.emailInput).toBeVisible();
    await expect(homePage.submitButton).toBeVisible();
  });

  test("form validates email format", async () => {
    // Test with invalid email
    await homePage.fillForm("invalid-email");
    const invalidState = await homePage.getFormValidationState();
    expect(invalidState.isValid, "Should reject invalid email").toBe(false);

    // Refresh page for clean state
    await homePage.goto();

    // Test with valid email
    await homePage.fillForm(testData.validEmails[0]);
    const validState = await homePage.getFormValidationState();
    expect(validState.isValid, "Should accept valid email").toBe(true);
  });

  test("form handles empty submission", async () => {
    await homePage.fillForm("");
    const formState = await homePage.getFormValidationState();
    expect(formState.isValid, "Should reject empty email").toBe(false);
  });

  test("form accepts special characters in email", async () => {
    const email = "test.user+label@domain.com";
    await homePage.fillForm(email);
    const formState = await homePage.getFormValidationState();
    expect(
      formState.isValid,
      "Should accept email with special characters",
    ).toBe(true);
  });
});