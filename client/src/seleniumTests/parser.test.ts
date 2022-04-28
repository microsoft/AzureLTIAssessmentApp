import {Builder, By, until, WebDriver} from "selenium-webdriver";
const homeUrl = `${process.env.REACT_APP_ASSESSMENT_APP_URL}/spa/home`
let driver: WebDriver;
jest.setTimeout(100000)


beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get(homeUrl);
    await driver.wait(until.urlContains('https://login.microsoftonline.com/'));
    await driver.wait(until.urlIs(homeUrl));
}, 5 * 60 * 1000)

afterAll(async () => {
    await driver.close();
})

const testsDirectory = `${__dirname}\\parser-test-files` 
console.log(testsDirectory)
describe("test question banks", () => {
    describe('test QTI parser', () => {

        it('Test QTI parser works with all question types', async () => {
            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}`);
            const newUploadButton = await driver.wait(until.elementLocated({className: 'upload-button'}));
            await newUploadButton.click();
            // Open Drop down
            const uploadFormatDropDown = await driver.wait(until.elementLocated({id:"upload format"}));
            uploadFormatDropDown.click()

            // Select format option
            const uploadFomatChoice = await driver.wait(until.elementLocated({id:"upload format-list3"}));
            uploadFomatChoice.click()
            
            // Upload file 
            const uploadFile = driver.findElement(By.xpath("//input[@name='file']"))
            await uploadFile.sendKeys(`${testsDirectory}\\QTI\\All-Question-Types-Test.xml`)
            //Press upload
            const finalUpload = await driver.wait(until.elementLocated({id:"final-upload"}));
            finalUpload.click()

            //Check if the file was uploaded successfully 
            await driver.wait(until.elementLocated({className:"successMsg"}))
        })
        it('Test QTI parser sends error alert on incorrect QTI file format', async () => {
            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}`);
            const newUploadButton = await driver.wait(until.elementLocated({className: 'upload-button'}));
            await newUploadButton.click();
            // Open Drop down
            const uploadFormatDropDown = await driver.wait(until.elementLocated({id:"upload format"}));
            uploadFormatDropDown.click()

            // Select format option
            const uploadFomatChoice = await driver.wait(until.elementLocated({id:"upload format-list3"}));
            uploadFomatChoice.click()
            
            // Upload file 
            const uploadFile = driver.findElement(By.xpath("//input[@name='file']"))
            await uploadFile.sendKeys(`${testsDirectory}\\QTI\\Incorrect-File-Format-Test.xml`)
            //Press upload
            const finalUpload = await driver.wait(until.elementLocated({id:"final-upload"}));
            finalUpload.click()

            // Wait to catch alerts
            await driver.wait(until.alertIsPresent(), 300000)
            const al = await driver.switchTo().alert()
            al.accept()
            driver.switchTo().defaultContent()
        })
    })

    describe('test GIFT parser', () => {

        it('Test GIFT parser works with all question types', async () => {
            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}`);
            const newUploadButton = await driver.wait(until.elementLocated({className: 'upload-button'}));
            await newUploadButton.click();
            // Open Drop down
            const uploadFormatDropDown = await driver.wait(until.elementLocated({id:"upload format"}));
            uploadFormatDropDown.click()

            // Select format option
            const uploadFomatChoice = await driver.wait(until.elementLocated({id:"upload format-list2"}));
            uploadFomatChoice.click()
            
            // Upload file 
            const uploadFile = driver.findElement(By.xpath("//input[@name='file']"))
            await uploadFile.sendKeys(`${testsDirectory}\\GIFT\\All-Question-Types-Test.txt`)
            //Press upload
            const finalUpload = await driver.wait(until.elementLocated({id:"final-upload"}));
            finalUpload.click()

            //Check if the file was uploaded successfully 
            await driver.wait(until.elementLocated({className:"successMsg"}))
        })
        it('Test GIFT parser works with coding questions', async () => {
            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}`);
            const newUploadButton = await driver.wait(until.elementLocated({className: 'upload-button'}));
            await newUploadButton.click();
            // Open Drop down
            const uploadFormatDropDown = await driver.wait(until.elementLocated({id:"upload format"}));
            uploadFormatDropDown.click()

            // Select format option
            const uploadFomatChoice = await driver.wait(until.elementLocated({id:"upload format-list2"}));
            uploadFomatChoice.click()
            
            // Upload file 
            const uploadFile = driver.findElement(By.xpath("//input[@name='file']"))
            await uploadFile.sendKeys(`${testsDirectory}\\GIFT\\Coding-Questions-Test.txt`)
            //Press upload
            const finalUpload = await driver.wait(until.elementLocated({id:"final-upload"}));
            finalUpload.click()

            //Check if the file was uploaded successfully 
            await driver.wait(until.elementLocated({className:"successMsg"}))
        })
        it('Test GIFT parser sends error alert on incorrect QTI file format', async () => {
            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}`);
            const newUploadButton = await driver.wait(until.elementLocated({className: 'upload-button'}));
            await newUploadButton.click();
            // Open Drop down
            const uploadFormatDropDown = await driver.wait(until.elementLocated({id:"upload format"}));
            uploadFormatDropDown.click()

            // Select format option
            const uploadFomatChoice = await driver.wait(until.elementLocated({id:"upload format-list2"}));
            uploadFomatChoice.click()
            
            // Upload file 
            const uploadFile = driver.findElement(By.xpath("//input[@name='file']"))
            await uploadFile.sendKeys(`${testsDirectory}\\GIFT\\Invalid-Format-Test.txt`)
            //Press upload
            const finalUpload = await driver.wait(until.elementLocated({id:"final-upload"}));
            finalUpload.click()

            // Wait to catch alerts
            await driver.wait(until.alertIsPresent(), 300000)
            const al = await driver.switchTo().alert()
            al.accept()
            driver.switchTo().defaultContent()


        })
    })

    describe('Microsoft Student Learn Curriculum', () => {

        it('Student learn curriculum parser works with all question types', async () => {

            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}`);
            const newUploadButton = await driver.wait(until.elementLocated({className: 'upload-button'}));
            await newUploadButton.click();
            // Open Drop down
            const uploadFormatDropDown = await driver.wait(until.elementLocated({id:"upload format"}));
            uploadFormatDropDown.click()

            // Select format option
            const uploadFomatChoice = await driver.wait(until.elementLocated({id:"upload format-list1"}));
            uploadFomatChoice.click()
            
            // Upload file 
            const uploadFile = driver.findElement(By.xpath("//input[@name='file']"))
            await uploadFile.sendKeys(`${testsDirectory}\\student-learn-curriculum\\Real-World-Datascience-Sample-Test.json`)
            //Press upload    
            const finalUpload = await driver.wait(until.elementLocated({id:"final-upload"}));
            finalUpload.click()

            //Check if the file was uploaded successfully 
            await driver.wait(until.elementLocated({className:"successMsg"}))
        })

        it('Student learn curriculum parser sends error alert on incorrect JSON file format', async () => {
            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}`);
            const newUploadButton = await driver.wait(until.elementLocated({className: 'upload-button'}));
            await newUploadButton.click();
            // Open Drop down
            const uploadFormatDropDown = await driver.wait(until.elementLocated({id:"upload format"}));
            uploadFormatDropDown.click()

            // Select format option
            const uploadFomatChoice = await driver.wait(until.elementLocated({id:"upload format-list1"}));
            uploadFomatChoice.click()
            
            // Upload file 
            const uploadFile = driver.findElement(By.xpath("//input[@name='file']"))
            await uploadFile.sendKeys(`${testsDirectory}\\student-learn-curriculum\\Invalid-Format-Test.json`)
            //Press upload
            const finalUpload = await driver.wait(until.elementLocated({id:"final-upload"}));
            finalUpload.click()

            // Wait to catch alerts
            await driver.wait(until.alertIsPresent(), 300000)
            const al = await driver.switchTo().alert()
            al.accept()
            driver.switchTo().defaultContent()
        })
    })

    describe('Original Parser', () => {

        it('Original parser works with all question types', async () => {

            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}`);
            const newUploadButton = await driver.wait(until.elementLocated({className: 'upload-button'}));
            await newUploadButton.click();
            // Open Drop down
            const uploadFormatDropDown = await driver.wait(until.elementLocated({id:"upload format"}));
            uploadFormatDropDown.click()

            // Select format option
            const uploadFomatChoice = await driver.wait(until.elementLocated({id:"upload format-list0"}));
            uploadFomatChoice.click()
            
            // Upload file 
            const uploadFile = driver.findElement(By.xpath("//input[@name='file']"))
            await uploadFile.sendKeys(`${testsDirectory}\\Original\\original.json`)
            //Press upload    
            const finalUpload = await driver.wait(until.elementLocated({id:"final-upload"}));
            finalUpload.click()

            //Check if the file was uploaded successfully 
            await driver.wait(until.elementLocated({className:"successMsg"}))
        })

        it('Original parser sends error alert on incorrect JSON file format', async () => {
            await driver.get(`${process.env.REACT_APP_ASSESSMENT_APP_URL}`);
            const newUploadButton = await driver.wait(until.elementLocated({className: 'upload-button'}));
            await newUploadButton.click();
            // Open Drop down
            const uploadFormatDropDown = await driver.wait(until.elementLocated({id:"upload format"}));
            uploadFormatDropDown.click()

            // Select format option
            const uploadFomatChoice = await driver.wait(until.elementLocated({id:"upload format-list1"}));
            uploadFomatChoice.click()
            
            // Upload file 
            const uploadFile = driver.findElement(By.xpath("//input[@name='file']"))
            await uploadFile.sendKeys(`${testsDirectory}\\Original\\original-invalid-file-format.json`)
            //Press upload
            const finalUpload = await driver.wait(until.elementLocated({id:"final-upload"}));
            finalUpload.click()

            // Wait to catch alerts
            await driver.wait(until.alertIsPresent(), 300000)
            const al = await driver.switchTo().alert()
            al.accept()
            driver.switchTo().defaultContent()
        })
    })

})