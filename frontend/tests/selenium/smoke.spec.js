const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

const BASE_URL = process.env.SELENIUM_BASE_URL || 'http://localhost:3000';
const HEADLESS = process.env.SELENIUM_HEADLESS !== 'false';

describe('Smart Farming UI smoke', function () {
  this.timeout(60000);
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

  it('loads the app and shows the root element', async () => {
    await driver.get(BASE_URL);

    // Wait for the root element that React mounts into
    const root = await driver.wait(
      until.elementLocated(By.id('root')),
      15000
    );

    const displayed = await root.isDisplayed();
    if (!displayed) {
      throw new Error('Root element is not visible');
    }
  });
});
