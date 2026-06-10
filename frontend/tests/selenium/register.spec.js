const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

const BASE_URL = process.env.SELENIUM_BASE_URL || 'http://localhost:3000';
const HEADLESS = process.env.SELENIUM_HEADLESS !== 'false';

async function findEnabled(driver, locator, timeoutMs = 15000) {
  const el = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(el), timeoutMs);
  await driver.wait(until.elementIsEnabled(el), timeoutMs);
  return el;
}

async function setInputValue(driver, el, value) {
  try {
    await el.clear();
    await el.sendKeys(value);
    return;
  } catch (_) {
    // fallback to JS
  }
  await driver.executeScript(
    "arguments[0].focus(); arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
    el,
    value
  );
}

describe('Register flow', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    const options = new edge.Options();
    if (HEADLESS) {
      options.addArguments('--headless=new');
    }
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('MicrosoftEdge')
      .setEdgeOptions(options)
      .build();
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('registers a new user and returns to login', async () => {
    await driver.get(`${BASE_URL}/register`);

    const unique = Date.now();
    const nameInput = await findEnabled(driver, By.css('[data-testid="register-name"]'));
    const emailInput = await findEnabled(driver, By.css('[data-testid="register-email"]'));
    const phoneInput = await findEnabled(driver, By.css('[data-testid="register-phone"]'));
    const passwordInput = await findEnabled(driver, By.css('[data-testid="register-password"]'));
    const confirmInput = await findEnabled(driver, By.css('[data-testid="register-confirm-password"]'));
    const submitBtn = await findEnabled(driver, By.css('[data-testid="register-submit"]'));

    const email = `selenium_${unique}@example.com`;

    await setInputValue(driver, nameInput, 'Selenium User');
    await setInputValue(driver, emailInput, email);
    await setInputValue(driver, phoneInput, '9876543210');
    await setInputValue(driver, passwordInput, 'Selenium@123');
    await setInputValue(driver, confirmInput, 'Selenium@123');

    await submitBtn.click();

    // Wait for success screen or redirect to login
    await driver.wait(
      async () => {
        const url = await driver.getCurrentUrl();
        if (url.endsWith('/') || url.includes('/?')) return true;
        const body = await driver.findElement(By.css('body'));
        const text = await body.getText();
        return text.includes('Account Created!') || text.includes('Redirecting to login');
      },
      20000
    );
  });
});
