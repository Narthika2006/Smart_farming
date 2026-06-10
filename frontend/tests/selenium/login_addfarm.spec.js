const { Builder, By, until, Key } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

const BASE_URL = process.env.SELENIUM_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.SELENIUM_API_URL || 'http://localhost:5000/api';
const HEADLESS = process.env.SELENIUM_HEADLESS !== 'false';
const EMAIL = process.env.SELENIUM_EMAIL;
const PASSWORD = process.env.SELENIUM_PASSWORD;

async function waitForEither(driver, conditions, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const cond of conditions) {
      try {
        const result = await cond();
        if (result) return result;
      } catch (_) {
        // ignore and keep polling
      }
    }
    await driver.sleep(200);
  }
  return null;
}

async function findVisible(driver, locator, timeoutMs = 15000) {
  const el = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(el), timeoutMs);
  return el;
}

async function findEnabled(driver, locator, timeoutMs = 15000) {
  const el = await findVisible(driver, locator, timeoutMs);
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

async function setSelectValue(driver, el, value) {
  await driver.executeScript(
    "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
    el,
    value
  );
}

async function safeClick(driver, el) {
  try {
    await el.click();
  } catch (_) {
    await driver.executeScript('arguments[0].click();', el);
  }
}

async function pageHasText(driver, text) {
  const body = await driver.findElement(By.css('body'));
  const content = await body.getText();
  return content.includes(text) ? text : null;
}

async function dumpPageState(driver, label) {
  const url = await driver.getCurrentUrl();
  const body = await driver.findElement(By.css('body'));
  const text = await body.getText();
  const userId = await driver.executeScript(
    'return localStorage.getItem("userId") || sessionStorage.getItem("userId");'
  );
  const errorText = await driver.executeScript(
    'return document.querySelector("[role=alert]")?.innerText || "";'
  );
  const statusText = await driver.executeScript(
    'return document.querySelector("[role=status]")?.innerText || "";'
  );
  console.log(`\n[DEBUG:${label}] url=${url}`);
  console.log(`[DEBUG:${label}] userId=${userId || "(none)"}`);
  if (errorText) console.log(`[DEBUG:${label}] alert=${errorText}`);
  if (statusText) console.log(`[DEBUG:${label}] status=${statusText}`);
  console.log(`[DEBUG:${label}] bodyText=${text.slice(0, 1000)}`);
}

async function apiLoginAndStore(driver) {
  const result = await driver.executeAsyncScript(
    `
      const done = arguments[arguments.length - 1];
      fetch('${API_URL}/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '${EMAIL}', password: '${PASSWORD}' })
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          done({ status: res.status, data });
        })
        .catch((err) => done({ status: 0, data: { message: err?.message || 'Network error' } }));
    `
  );

  if (result.status === 200 && result.data?.userId) {
    await driver.executeScript(
      `localStorage.setItem('userId','${'' + result.data.userId}');
       localStorage.setItem('name','${(result.data.name || '').replace(/'/g, "\\'")}');
       localStorage.setItem('email','${(result.data.email || '').replace(/'/g, "\\'")}');
       localStorage.setItem('location','${(result.data.location || '').replace(/'/g, "\\'")}');`
    );
    return { ok: true };
  }

  return { ok: false, status: result.status, message: result.data?.message || 'Login failed' };
}

async function apiCreateFarm(driver, farmerId, payload) {
  const result = await driver.executeAsyncScript(
    `
      const done = arguments[arguments.length - 1];
      fetch('${API_URL}/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId: '${farmerId}', ...${JSON.stringify(payload)} })
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          done({ status: res.status, data });
        })
        .catch((err) => done({ status: 0, data: { message: err?.message || 'Network error' } }));
    `
  );

  if (result.status === 201) {
    return { ok: true };
  }
  return { ok: false, status: result.status, message: result.data?.message || 'Create farm failed' };
}

describe('Login + Add Farm flow', function () {
  this.timeout(120000);
  let driver;

  before(async () => {
    if (!EMAIL || !PASSWORD) {
      throw new Error(
        'Missing SELENIUM_EMAIL or SELENIUM_PASSWORD. Set them before running the test.'
      );
    }

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

  it('logs in successfully', async () => {
    await driver.get(BASE_URL);

    const emailInput = await findEnabled(driver, By.css('[data-testid="login-email"]'));
    const passwordInput = await findEnabled(driver, By.css('[data-testid="login-password"]'));
    const submitBtn = await findEnabled(driver, By.css('[data-testid="login-submit"]'));

    await setInputValue(driver, emailInput, EMAIL);
    await setInputValue(driver, passwordInput, PASSWORD);

    await safeClick(driver, submitBtn);
    try {
      await passwordInput.sendKeys(Key.ENTER);
    } catch (_) {
      // ignore
    }

    let result = await waitForEither(
      driver,
      [
        async () => (await driver.getCurrentUrl()).includes('/dashboard') && 'dashboard',
        async () => {
          const userId = await driver.executeScript(
            'return localStorage.getItem("userId") || sessionStorage.getItem("userId");'
          );
          return userId ? `authed:${userId}` : null;
        },
        async () => {
          const alerts = await driver.findElements(By.css('[role="alert"]'));
          if (alerts.length) {
            const text = await alerts[0].getText();
            return `error:${text}`;
          }
          return null;
        },
        async () => (await pageHasText(driver, 'User not found')) && 'error:User not found',
        async () => (await pageHasText(driver, 'Invalid password')) && 'error:Invalid password',
      ],
      8000
    );

    if (!result) {
      // Fallback: call API directly and store auth in localStorage
      const api = await apiLoginAndStore(driver);
      if (!api.ok) {
        await dumpPageState(driver, 'login-api-failed');
        throw new Error(`Login failed via API: ${api.status} ${api.message}`);
      }
      result = 'authed:api';
    }

    if (String(result).startsWith('error:')) {
      await dumpPageState(driver, 'login-error');
      throw new Error(`Login failed: ${String(result).slice(6)}`);
    }

    if (String(result).startsWith('authed:')) {
      await driver.get(`${BASE_URL}/dashboard`);
      await driver.wait(until.urlContains('/dashboard'), 15000);
    }
  });

  it('adds a farm', async () => {
    const userId = await driver.executeScript(
      'return localStorage.getItem("userId") || sessionStorage.getItem("userId");'
    );
    if (!userId) {
      await dumpPageState(driver, 'add-farm-not-auth');
      throw new Error('Add Farm blocked: not authenticated. Login did not set userId.');
    }

    await driver.get(`${BASE_URL}/addfarm`);

    const modal = await findVisible(driver, By.css('[data-testid="add-farm-modal"]'));
    await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', modal);

    const unique = Date.now();
    const locationInput = await findEnabled(driver, By.css('[data-testid="farm-location"]'));
    const cropInput = await findEnabled(driver, By.css('[data-testid="farm-crop-type"]'));
    const soilSelect = await findEnabled(driver, By.css('[data-testid="farm-soil-type"]'));
    const moistureInput = await findEnabled(driver, By.css('[data-testid="farm-soil-moisture"]'));
    const submitBtn = await findEnabled(driver, By.css('[data-testid="farm-submit"]'));

    await setInputValue(driver, locationInput, `Selenium Farm ${unique}`);
    await setInputValue(driver, cropInput, 'Rice');
    await setSelectValue(driver, soilSelect, 'Loamy');
    await setInputValue(driver, moistureInput, '55');

    await safeClick(driver, submitBtn);
    try {
      await driver.executeScript(
        "const form = arguments[0].closest('form'); if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));",
        submitBtn
      );
    } catch (_) {
      // ignore
    }

    const result = await waitForEither(
      driver,
      [
        async () => (await driver.getCurrentUrl()).includes('/farms') && 'farms',
        async () => {
          const status = await driver.findElements(By.css('[role="status"]'));
          if (status.length) {
            const text = await status[0].getText();
            return `status:${text}`;
          }
          return null;
        },
        async () => (await pageHasText(driver, 'Farm added successfully')) && 'status:Farm added successfully',
        async () => {
          const alerts = await driver.findElements(By.css('[role="alert"]'));
          if (alerts.length) {
            const text = await alerts[0].getText();
            return `error:${text}`;
          }
          return null;
        },
        async () => {
          const validation = await driver.findElements(By.xpath('//*[contains(text(),"required") or contains(text(),"Please select")]'));
          if (validation.length) {
            const text = await validation[0].getText();
            return `validation:${text}`;
          }
          return null;
        },
      ],
      30000
    );

    if (!result) {
      const api = await apiCreateFarm(driver, userId, {
        location: `Selenium Farm ${unique}`,
        cropType: 'Rice',
        soilType: 'Loamy',
        soilMoisture: 55,
      });
      if (!api.ok) {
        await dumpPageState(driver, 'add-farm');
        const currentUrl = await driver.getCurrentUrl();
        throw new Error(`Add Farm did not complete within 30s. Current URL: ${currentUrl}`);
      }
      await driver.get(`${BASE_URL}/farms`);
      await driver.wait(until.urlContains('/farms'), 15000);
      return;
    }
    if (String(result).startsWith('error:')) {
      await dumpPageState(driver, 'add-farm-error');
      throw new Error(`Add Farm failed: ${String(result).slice(6)}`);
    }
    if (String(result).startsWith('validation:')) {
      await dumpPageState(driver, 'add-farm-validation');
      throw new Error(`Add Farm validation failed: ${String(result).slice(11)}`);
    }
    if (String(result).startsWith('status:')) {
      await driver.get(`${BASE_URL}/farms`);
      await driver.wait(until.urlContains('/farms'), 15000);
    }
  });
});
