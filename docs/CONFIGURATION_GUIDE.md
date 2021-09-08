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

1. Open Moodle LMS and sign in with the admin account.
2. Click **Site Administration** from the left navigation pane.
3. Select **Plugins**.
4. Under Activity modules, click **Manage tools**.
5. Click **Configure a tool manually**.
6. Enter the following information:
    * **Tool name:** give the tool a name of your choice. For example: "Assessment App".
    * **Tool URL:** enter the "Launch URL" from the Platform Registration Tool.
    * **LTI version:** LTI 1.3
    * **Public key type:** Keyset URL
    * **Public keyset:** enter "Public JWK Set URL" from the Platform Registration Tool.
    * **Initiate login URL:** enter "Login URL" from the Platform Registration Tool.
    * **Redirection URI(s):** enter the "Launch URL" from the Platform Registration Tool.
    * **Default launch container:** New window.
7. Under Services:
    * **IMS LTI Assignment and Grade Services:** select Use this service for grade sync and column management.
    * **IMS LTI Names and Role Provisioning:** select Use this service to retrieve members’ information as per privacy.
9. Under Privacy, select the following options:
    * Share launcher’s name with tool: **Always**
    * Share launcher’s email with tool: **Always**
    * Accept grades from the tool: **Always**
10. Click **Save changes**. The tool should now appear and be listed with the name you provided.
11. Click the icon on the tool that represents **View configuration details**.
12. Take note of the following parameters:
    * Platform ID
    * Client ID
    * Public keyset URL
    * Access token URL
    * Authentication request URL
13. Continue to configure the Assessment App, by registering the parameters back in the Platform Registration Tool.

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
