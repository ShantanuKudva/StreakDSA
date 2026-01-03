import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  // ===========================================
  // LANDING PAGE TESTS
  // ===========================================
  test.describe("Landing Page", () => {
    test("landing page is publicly accessible", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("StreakDSA")).toBeVisible();
      await expect(page.getByText("Build Unbreakable")).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Get Started/i })
      ).toBeVisible();
    });

    test("dashboard redirects to login when not authenticated", async ({
      page,
    }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  // ===========================================
  // LOGIN PAGE TESTS
  // ===========================================
  test.describe("Login Page", () => {
    test("renders correctly with all auth options", async ({ page }) => {
      await page.goto("/login");

      // Branding
      await expect(page.getByText("StreakDSA")).toBeVisible();

      // OAuth buttons
      await expect(
        page.getByRole("button", { name: /Continue with Google/i })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Continue with GitHub/i })
      ).toBeVisible();

      // Email/Password option
      await expect(
        page.getByRole("button", { name: /Use Email & Password/i })
      ).toBeVisible();

      // Legal links
      await expect(
        page.getByRole("link", { name: /Terms of Service/i })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Privacy Policy/i })
      ).toBeVisible();
    });

    test("email form expands when clicked", async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("button", { name: /Use Email & Password/i }).click();

      await expect(page.getByLabel(/Email/i)).toBeVisible();
      await expect(page.getByLabel(/Password/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Sign In/i })
      ).toBeVisible();
    });

    test("shows validation error for empty credentials", async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("button", { name: /Use Email & Password/i }).click();

      // Try to submit empty form - browser validation should prevent
      const signInButton = page.getByRole("button", { name: /Sign In/i });
      await signInButton.click();

      // Email field should be required
      const emailField = page.getByLabel(/Email/i);
      await expect(emailField).toHaveAttribute("required", "");
    });

    // Error message tests
    test("shows OAuthAccountNotLinked error message", async ({ page }) => {
      await page.goto("/login?error=OAuthAccountNotLinked");
      await expect(
        page.getByText(
          /This email is already registered with a different sign-in method/i
        )
      ).toBeVisible();
    });

    test("shows OAuthConflict error message", async ({ page }) => {
      await page.goto("/login?error=OAuthConflict");
      await expect(
        page.getByText(
          /This email is already registered with a different sign-in method/i
        )
      ).toBeVisible();
    });

    test("shows UserNotFound error with register link", async ({ page }) => {
      await page.goto("/login?error=UserNotFound");
      await expect(
        page.getByText(/No account found with this email/i)
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Create an account/i })
      ).toBeVisible();
    });

    test("shows InvalidPassword error message", async ({ page }) => {
      await page.goto("/login?error=InvalidPassword");
      await expect(page.getByText(/Incorrect password/i)).toBeVisible();
    });

    test("UserNotFound register link navigates to /register", async ({
      page,
    }) => {
      await page.goto("/login?error=UserNotFound");
      await page.getByRole("link", { name: /Create an account/i }).click();
      await expect(page).toHaveURL(/\/register/);
    });

    // Navigation tests
    test("navigates to terms page", async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("link", { name: /Terms of Service/i }).click();
      await expect(page).toHaveURL(/terms/);
    });

    test("navigates to privacy page", async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("link", { name: /Privacy Policy/i }).click();
      await expect(page).toHaveURL(/privacy/);
    });
  });

  // ===========================================
  // REGISTRATION PAGE TESTS
  // ===========================================
  test.describe("Registration Page", () => {
    test("renders registration form correctly", async ({ page }) => {
      await page.goto("/register");

      await expect(page.getByText("StreakDSA")).toBeVisible();
      await expect(page.getByText("Create Account")).toBeVisible();
      await expect(page.getByLabel(/Email/i)).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
      await expect(page.getByLabel("Confirm Password")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Create Account/i })
      ).toBeVisible();
    });

    test("shows back to login link", async ({ page }) => {
      await page.goto("/register");
      await expect(
        page.getByRole("link", { name: /Back to login/i })
      ).toBeVisible();
    });

    test("back to login navigates correctly", async ({ page }) => {
      await page.goto("/register");
      await page.getByRole("link", { name: /Back to login/i }).click();
      await expect(page).toHaveURL(/\/login/);
    });

    test("shows error when passwords do not match", async ({ page }) => {
      await page.goto("/register");

      await page.getByLabel(/Email/i).fill("test@example.com");
      await page.getByLabel("Password").fill("password123");
      await page.getByLabel("Confirm Password").fill("different123");
      await page.getByRole("button", { name: /Create Account/i }).click();

      await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
    });

    test("shows error when password is too short", async ({ page }) => {
      await page.goto("/register");

      await page.getByLabel(/Email/i).fill("test@example.com");
      await page.getByLabel("Password").fill("short");
      await page.getByLabel("Confirm Password").fill("short");
      await page.getByRole("button", { name: /Create Account/i }).click();

      await expect(
        page.getByText(/Password must be at least 8 characters/i)
      ).toBeVisible();
    });

    test("all form fields are required", async ({ page }) => {
      await page.goto("/register");

      const emailField = page.getByLabel(/Email/i);
      const passwordField = page.getByLabel("Password");
      const confirmField = page.getByLabel("Confirm Password");

      await expect(emailField).toHaveAttribute("required", "");
      await expect(passwordField).toHaveAttribute("required", "");
      await expect(confirmField).toHaveAttribute("required", "");
    });
  });

  // ===========================================
  // REGISTRATION API TESTS
  // ===========================================
  test.describe("Registration API", () => {
    test("returns error for invalid email", async ({ request }) => {
      const response = await request.post("/api/auth/register", {
        data: { email: "invalid-email", password: "password123" },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("Invalid email");
    });

    test("returns error for short password", async ({ request }) => {
      const response = await request.post("/api/auth/register", {
        data: { email: "test@example.com", password: "short" },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("at least 8 characters");
    });

    test("returns error for missing fields", async ({ request }) => {
      const response = await request.post("/api/auth/register", {
        data: {},
      });

      expect(response.status()).toBe(400);
    });

    // Note: Testing actual registration requires database cleanup
    // These tests verify validation only, not actual user creation
  });

  // ===========================================
  // PROTECTED ROUTES TESTS
  // ===========================================
  test.describe("Protected Routes", () => {
    test("/dashboard requires authentication", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/login/);
    });

    test("/profile requires authentication", async ({ page }) => {
      await page.goto("/profile");
      await expect(page).toHaveURL(/\/login/);
    });

    test("/logs requires authentication", async ({ page }) => {
      await page.goto("/logs");
      await expect(page).toHaveURL(/\/login/);
    });

    test("/onboard requires authentication", async ({ page }) => {
      await page.goto("/onboard");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  // ===========================================
  // PUBLIC ROUTES TESTS
  // ===========================================
  test.describe("Public Routes", () => {
    test("/ is publicly accessible", async ({ page }) => {
      await page.goto("/");
      await expect(page).not.toHaveURL(/\/login/);
    });

    test("/login is publicly accessible", async ({ page }) => {
      await page.goto("/login");
      await expect(page).toHaveURL(/\/login/);
    });

    test("/register is publicly accessible", async ({ page }) => {
      await page.goto("/register");
      await expect(page).toHaveURL(/\/register/);
    });

    test("/terms is publicly accessible", async ({ page }) => {
      await page.goto("/terms");
      await expect(page).toHaveURL(/\/terms/);
      await expect(
        page.getByRole("heading", { name: /Terms of Service/i })
      ).toBeVisible();
    });

    test("/privacy is publicly accessible", async ({ page }) => {
      await page.goto("/privacy");
      await expect(page).toHaveURL(/\/privacy/);
      await expect(
        page.getByRole("heading", { name: /Privacy Policy/i })
      ).toBeVisible();
    });
  });
});
