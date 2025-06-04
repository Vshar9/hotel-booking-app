import {test,expect} from '@playwright/test';

const UI_URL = "http://localhost:5173";

test.beforeEach(async ({ page }) => {
  await page.goto(UI_URL);
  await page.getByRole("link", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await page.locator('[name="email"]').fill("1@1.com");
  await page.locator('[name="password"]').fill("password");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Sign in successful!")).toBeVisible();
});

test("Should show hotel search results", async({page})=>{
  await page.goto(UI_URL);
  await page.getByPlaceholder("Where are you going?").fill("Jaipur")
  await page.getByRole("button",{name:"Search"}).click()
  await expect(page.getByText("Hotels found in Jaipur")).toBeVisible()
  await expect(page.getByText("Gate Hotels")).toBeVisible()
})

test("Should show hotel details",async ({page})=>{
  await page.goto(UI_URL)
  await page.getByPlaceholder("Where are you going?").fill("Jaipur")
  await page.getByRole("button",{name:"Search"}).click()
  await page.getByText("Gate Hotels").click()
  await expect(page).toHaveURL(/detail/);
  await expect(page.getByRole("button",{
    name: "Book now"
  })).toBeVisible();
})
test("should book hotel", async ({ page }) => {
  await page.goto(UI_URL);
  await page.getByPlaceholder("Where are you going?").fill("Jaipur");

  await page.getByPlaceholder("Check-out Date").click();

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  const day = targetDate.getDate().toString();

  await page.getByRole("dialog") // or replace with your calendar container
    .getByText(day, { exact: true })
    .click();

  await page.getByRole("button", { name: "Search" }).click();
  await page.getByText("Gate Hotels").click();
  await page.getByRole("button", { name: "Book now" }).click();

  await page.waitForTimeout(3000);

  await expect(page.getByText("Total Cost:")).toBeVisible();

  const stripeFrame = page.frameLocator("iframe").first();
  await stripeFrame.getByPlaceholder("Card number").fill("4242 4242 4242 4242");
  await stripeFrame.getByPlaceholder("MM / YY").fill("04/30");
  await stripeFrame.getByPlaceholder("CVC").fill("242");
  await stripeFrame.getByPlaceholder("ZIP").fill("112233");

  await page.getByRole("button", { name: "Confirm Booking" }).click();
  await expect(page.getByText("Booking Saved!")).toBeVisible();

  await page.getByRole("link",{name: "My Bookings"}).click();
  await expect(page.getByText("Gate Hotels")).toBeVisible();
});

