import {Builder, until, WebDriver} from "selenium-webdriver";

const homeUrl = `${process.env.REACT_APP_ASSESSMENT_APP_URL}/spa/home`
let driver: WebDriver;

beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get(homeUrl);
    await driver.wait(until.urlContains('https://login.microsoftonline.com/'));
    await driver.wait(until.urlIs(homeUrl));
}, 5 * 60 * 1000)

afterAll(async () => {
    await driver.close();
})

describe("test question banks", () => {
    const name = "Selenium Test Question Bank";
    const description = "Description of question bank.";
    let questionBankId = '';

    it('create question bank', async () => {
        await driver.get(homeUrl);
        await driver.wait(until.elementLocated({id: "home-page-tabs"}));

        const newBankButton = await driver.findElement({className: "new-question-bank-button"});
        await newBankButton.click();

        const newBankContainer = await driver.wait(until.elementLocated({id: "new-question-bank-container"}));
        const nameInput = await newBankContainer.findElement({id: "input-question-bank-name"});
        const descriptionInput = await newBankContainer.findElement({id: "input-question-bank-description"});
        const createBankButton = await newBankContainer.findElement({id: "create-question-bank-button"});

        await nameInput.sendKeys(name);
        await descriptionInput.sendKeys(description);

        await createBankButton.click();
        await driver.wait(until.urlContains("/spa/question-bank/"))

        const url = await driver.getCurrentUrl()
        const result = /.*\/spa\/question-bank\/(.*)/[Symbol.match](url);
        expect(result).toBeTruthy()
        questionBankId = result ? result[1] : '';
        expect(questionBankId).toBeTruthy();
    })

    it('navigate to question bank page', async () => {
        await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}/spa/question-bank/${questionBankId}`)
        const bankName = await driver.wait(until.elementLocated({id: "question-bank-name"}));
        const bankDescription = await driver.wait(until.elementLocated({id: "question-bank-description"}));

        await driver.wait(until.elementTextIs(bankName, name));
        expect(await bankDescription.getText()).toEqual(description);
    })

    describe('test questions', () => {
        it('create question', async () => {
            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}/spa/question-bank/${questionBankId}`);
            const newQuestionButton = await driver.wait(until.elementLocated({className: 'new-question-button'}));
            await newQuestionButton.click();

            const nameInput = await driver.wait(until.elementLocated({id: "question-name-input"}));
            const descriptionInput = await driver.wait(until.elementLocated({id: "question-description-input"}));
            const option0Input = await driver.wait(until.elementLocated({id: "question-option-0"}));
            const option1Input = await driver.wait(until.elementLocated({id: "question-option-1"}));
            const createButton = await driver.wait(until.elementLocated({id: "create-question-button"}));

            await nameInput.sendKeys("2 + 2")
            await descriptionInput.sendKeys("What is the result of the sum of 2 and 2?");
            await option0Input.sendKeys("4");
            await option1Input.sendKeys("5");

            await createButton.click();
            await driver.wait(until.urlContains("/spa/question-bank/"))
        })
    })
})