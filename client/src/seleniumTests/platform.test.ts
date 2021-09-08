import {Builder, until, WebDriver} from "selenium-webdriver";


const platformUrl = `${process.env.REACT_APP_ASSESSMENT_APP_URL}/spa/platform`
let driver: WebDriver;

beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get(platformUrl);
    await driver.wait(until.urlContains('https://login.microsoftonline.com/'));
    await driver.wait(until.urlIs(platformUrl));
    await driver.wait(until.elementLocated({id: "top-header"}));
}, 5 * 60 * 1000)

afterAll(async () => {
    await driver.close();
})

it('platform url', async () => {
    expect(await driver.getCurrentUrl()).toEqual(platformUrl);
})

it('main header name', async () => {
    const header = await driver.findElement({id: "top-header"});
    const name = await header.findElement({xpath: "./div/button/span"});
    expect(await name.getText()).toEqual("Platform registration");
})