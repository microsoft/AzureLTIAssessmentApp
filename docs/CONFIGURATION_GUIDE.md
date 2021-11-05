## Configuration Guide

The following guide shows the steps to configure Moodle LMS to work with the Assessment App. Please, check if you obtained the following parameters from the Platform Registration Tool:

* Login URL
* Launch URL
* Domain URL
* Public Key
* Public JWK
* Public JWK Set URL

If you are not the one who deployed the application, you need to obtain the parameters from that person.

Complete the following steps to configure the Assessment App in Moodle:

### Moodle LTI 1.3

1. Open your LMS and sign in with the admin account.
2. Click **Site administration** from the left navigation pane.
![Config.1](/images/Config.1.PNG)
3. Select **Plugins**.
![Config.2](/images/Config.2.PNG)
4. Under **Activity modules**, click **Manage tools**.
![Config.3](/images/Config.3.PNG)
5. Click **configure a tool manually**.
![Config.4](/images/Config.4.png)
6. Enter the following information:
 * **Tool name**: give the tool a name of your choice. For example: "Assessment App".
 * **Tool URL**: enter the "Launch URL" from LTI Assessment App application’s registration page LTI Assessment App registration page.
 * **LTI version**: LTI 1.3
 * **Public key type**: Keyset URL
 * We recommend to use the **Keyset URL** as the **Public Key type**. 
 * **Public keyset**: enter "Public JWK Set URL" from the LTI Assessment App’s registration page.
 * If you select **RSA key**, instead of **Keyset URL**, as **Public key type**, you can enter the "Public Key" from the LTI Assessment App's registration page instead of the "Public JWK Set URL". 
 * **Initiate login URL**: enter "Login URL" from the LTI Assessment App’s registration page.
 * **Redirection URI(s)**: enter the "Launch URL" from LTI Assessment App’s registration page.
 * **Default launch container**: New window
![Config.5](/images/Config.5.png)
![Config.6](/images/Config.6.png)
7. Under **Services**.
* **IMS LTI Assignment and Grade Services:** select **Use this service for grade sync and column management.**
* **IMS LTI Names and Role Provisioning:** **select Use this service to retrieve members’ information as per privacy settings.**
![Config.8](/images/Config.8.png)
8. Under **Privacy**, select the following options:
 * **Share launcher’s name with tool**: Always
 * **Share launcher’s email with tool**: Always
 * **Accept grades from the tool**: Always
![Config.9](/images/Config.9.png)
9. Click **Save changes**. The tool should now appear and listed with the name you provided. 
10.	Click the icon on the tool that represent **View configuration details**.
![Config.12](/images/Config.12.PNG)
11. Take note of the following parameters:
 * Platform ID
 * Client ID
 * Public keyset URL
 * Access token URL
 * Authentication request URL
12.	Continue to configure the LTI Assessment App, by registering the parameters back in the LTI Assessment App's registration page.

The following steps show how to register the parameters back in the LTI Assessment App's registration page. 

1. Open the tool registration page from your browser.
2. Enter the following information:
 * **Display name**: give the tool a name of your choice. 
 * **Issuer**: enter "Platform ID" from the LTI tool configuration details, from the Moodle LMS.
 * **JWK Set URL**: enter "Public keyset URL" from the LTI tool configuration details, from the Moodle LMS.
 * **Access Token URL**: enter "Access token URL" from the LTI tool configuration details, from the Moodle LMS.
 * **Authorization URL**: enter "Authentication request URL" from the LTI tool configuration details, from the Moodle LMS.
 * **Client ID**: enter "Client ID" from the LTI tool configuration details, from the Moodle LMS.
![Config.11](/images/Config.11.png)
3. Optionally, you can add your Institution name and logo on the registration page.
4. Click **SAVE REGISTRATION**.

You're all set. The Azure LTI Assessment tool is now configured on your Moodle LMS and your Educators will be able to use it to bring assessments and grading to their courses. Follow the [educator guide](./EDUCATOR_GUIDE.md) to create assignments that use the LTI Assessment Application.

The following steps show how to register the parameters back in the Platform Registration Tool.
1. Open the Platform Registration Tool in your browser.
2. Enter the following information:
    * **Display name:** give the tool a name of your choice.
    * **Issuer:** enter "Platform ID" from the LTI tool configuration details, from the Moodle LMS.
    * **JWK Set URL:** enter "Public keyset URL" from the LTI tool configuration details, from the Moodle LMS.
    * **Access Token URL:** enter "Access token URL" from the LTI tool configuration details, from the Moodle LMS.
    * **Authorization URL:** enter "Authentication request URL" from the LTI tool configuration details, from the Moodle LMS.
    * **Client ID:** enter "Client ID" from the LTI tool configuration details, from the Moodle LMS.
3. Optionally, you can add your Institution name and logo on the registration page.
4. Click **Save Registration**.

The Assessment App is now configured on Moodle LMS and educators will be able to use it.
