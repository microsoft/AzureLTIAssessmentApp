# How to run tests? 

There are 4 test files in the ./client/src/seleniumTests folder 

1. parser.test.ts - Run this file by typing ```npm run test parser.test.ts```. This file tests functionality of the parser that allows loading different export formats QTI, GIFT, Microsoft Open Source Curriculum. 
2. platform.test.ts - Run this file by typing ```npm run test platform.test.ts```
This file tests whether the 'platform' page loads. 
3. questionTypes.test.ts - Run this file by typing ```npm run test questionTypes.test.ts```
This file tests whether the following question types can be created 'Multiple Answer Question', 'Multiple Choice Question', 'True/False Question', 'Long/Short answer Question'. 
4. teacherHome.test.ts - Run this file by typing ```npm run test teacherHome.test.ts```
This file tests whether a question bank can be created, and a question can be created. 