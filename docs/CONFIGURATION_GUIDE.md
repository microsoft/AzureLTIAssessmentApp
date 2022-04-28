# Configure the tool

The following guide shows the steps to configure several popular LMS to work with the Assessment Application. If your LMS is not listed here, consult your LMS vendor on how to configure LTI application. Regardless of the LMS, the typical workflow should remain the same:

1. Obtain parameters from the deployed  LTI Assessment Application’s registration page
2. Configure an LTI tool on the LMS using the parameters from step 1.
3. Obtain parameters from the configured LTI tool.
4. Configure the LTI Assessment Application using the parameters from step 3.

By now, you should've obtained the following parameters from the LTI Assessment Application’s registration page. If not, follow the [deployment guide](./DEPLOYMENT_GUIDE.md) to deploy Assessment Application LTI application and obtain the following parameters from the registration page.

- Login URL
- Launch URL
- Domain URL
- Public Key
- Public JWK
- Public JWK Set URL

If you are not the one who deployed the application, you need to obtain the parameters from that person.

The configuration steps slightly differ depending on the LMS you are using. In general, they will involve registering the Assessment Application as an external tool in the LMS and registering the parameters of external tool back in the Assessment Application's registration page. The following examples show how to configure Assessment Application with three of the popular LMS.

- [Moodle](#Moodle-LMS)
- [Canvas](#Canvas-LMS)


## Moodle LMS

LTI 1.3

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


## Canvas LMS

The following steps show how to configure an LTI tool on a Canvas LMS.

### LTI 1.1

At this time, we do not support LTI 1.1 with Canvas LMS.
 
### LTI 1.3

The LTI 1.3 and LTI Advantage platform requires a tool to be initially configured in the Developer Keys page, followed by being added to an account or course. First, configure the tool in the Developer Keys page.

1. Open your LMS and sign in with the admin account (Users who want to manage Developer Keys must have the **Developer Keys - manage** permission).
2. Click **Admin** from the left navigation pane, then click the name of the account.
3. Click **Developer Keys**.
4. Click **+Developer Key** and click **+LTI Key**.
5. Enter the following information:
 * **Key Name**: give the tool a name of your choice. For example: "Assessment Application".
 * **Redirection URIs**: enter the "Launch URL" from Assessment application’s registration page. 
 * **Method**: select **Manual Entry**
 * **Title**: give the tool a title.
 * **Description**: give the tool a description.
 * **Target Link URI**: enter the "Launch URL" from Assessment application’s registration page.
 * **OpenID Connect Initiation URI**: enter "Login URL" from the Assessment application’s registration page.
 * **JWK Method**: select **Public JWK URL**
 * We recommend to select the **Public JWK URL** as **JWK Method**. 
 * If you are trying to connect to a locally hosted Assessment Application, you will need to use the **JWK Method** method. 
 * **Public JWK URL**: enter "Public JWK Set URL" from the Assessment Application’s registration page.
 * If you select **Public JWK**, instead of **Public JWK URL**, as **JWK Method**, you can enter the "Public JWK" from the Assessment Application's registration page instead of the "Public JWK Set URL".
![Config.Canvas.2](/images/Config.Canvas.2.png). 
6. Under **LTI Advantage Services**, enable the following options:
 * Can create and view assignment data in the gradebook associated with the tool.
 * Can view assignment data in the gradebook associated with the tool.
 * Can view submission data for assignments associated with the tool.
 * Can create and update submission results for assignments associated with the tool.
 * Can retrieve user data associated with the context the tool is installed in.
 * Can lookup Account information
 * Can list categorized event types.
![Config.Canvas.3](/images/Config.Canvas.3.png) 
7. Under **Additional Settings**, select the **Privacy Level** as **PUBLIC**.
![Config.Canvas.4](/images/Config.Canvas.4.png) 
8. Under **Placements**, make sure **Link Selection** and **Assignment Selection** are selected.
![Config.Canvas.5](/images/Config.Canvas.5.png) 
9. Click **Save**. The key should now appear and listed with the name you provided. 
10. Ensure that the newly added key is set to **Enabled**.
11. Ensure to uncheck the "eye" for the key under the "Actions", as it allows the developer key to be used. 
11. Take note of the following parameters:
 * **Client ID**: the number in the **Details** column, above the **Show Key** button
![Config.Canvas.6](/images/Config.Canvas.6.png) 

At the account level, external tools must be installed in the External Apps page in Account Settings. The Assessment Application can be added via the Client ID option. Only the Client ID is required to be added.

1. Click **Settings** from the left navigation pane.
2. Click **View App Configurations**.
3. Click **+App**.
4. Enter the following information:
 * **Configuration Type**: select **By Client ID**
 * **Client ID**: enter the "Client ID" from the LTI key registration.
![Config.Canvas.7](/images/Config.Canvas.7.png) 
5. Click **Submit**.
6. If the Client ID is associated with an external tool, the tool name displays in the page. The page also confirms the tool should be installed.
![Config.Canvas.8](/images/Config.Canvas.8.png) 
7. Click **Install**.
8. Repeat the above installation steps to install the application to every course you wish to use it in. 
9. Continue to configure the Assessment application, by registering the parameters back in the Assessment application's registration page.

The following steps show how to register the parameters back in the Assessment application's registration page. If you are not the one who deployed the application, you need to provide these parameters to that person.

1. Open the tool registration page from your browser.
2. Enter the following information:
  * **Display name**: give the tool a name of your choice. 
  * **Issuer**: enter **https://canvas.instructure.com** (this should always be canvas.infrastructure.com not matter your tenant url)
  * **JWK Set URL**: enter https://[tenant-name].instructure.com/api/lti/security/jwks
  * **Access Token URL**: enter https://[tenant-name].instructure.com/login/oauth2/token 
  * **Authorization URL**: enter https://[tenant-name].instructure.com/api/lti/authorize_redirect 
   NOTE: [tenant-name] is where your Canvas tenant name hosted by instructure. For example if the url of the LMS is https://canvas1.instructure.com, then the [tenant-name] is "canvas1". If you are using self-hosted Canvas, replace https://[tenant-name].instructure.com with your canvas URL.
  * **Client ID**: enter "Client ID" from the LTI key registration.
  * **Audience**: This can be left blank 
3. Optionally, you can add your Institution name and logo on the registration page.
4. Click **SAVE REGISTRATION**.

You're all set. The Assessment tool is now configured on your Canvas LMS and your Educators will be able to use it within their courses. Follow the [educator guide](./USER_GUIDE.md) to create assignments that use the Assessment Application tool.


