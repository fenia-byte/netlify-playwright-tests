# Netlify Website Automated Tests

This repository contains automated tests for the Netlify website using Playwright and TypeScript.

## Test Cases

1. **Lead Capture Form Validation**
   - Validates newsletter form functionality
   - Tests form submission with valid/invalid data
   - Verifies user feedback

2. **Sitemap and Crawlability Verification**
   - Verifies sitemap.xml existence and accessibility
   - Checks URL accessibility
   - Validates robots meta tags

3. **404 Link Verification**
   - Checks for broken links across pages

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd netlify-playwright-tests
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

Run all tests:
```bash
npx playwright test
```

Run specific test file:
```bash
npx playwright test tests/leadForm.spec.ts
```

Run tests with UI mode:
```bash
npx playwright test --ui
```

View test report:
```bash
npx playwright show-report
```

## Project Structure

```
├── tests/              # Test files
├── pages/              # Page Object Models
├── utils/              # Utility functions
└── playwright.config.ts # Playwright configuration
```

## Technical Approach

- Implemented using Page Object Model pattern for better maintainability
- Utilized TypeScript for type safety
- Included comprehensive error handling
- Followed DRY principles
- Added detailed assertions and validations

## Assumptions & Limitations

- Tests are designed for the public-facing pages of Netlify
- Some tests (like sitemap verification) sample a subset of URLs to maintain reasonable execution time
- Form testing assumes specific form structure and feedback messages
- Tests are designed to run in a CI/CD environment

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
