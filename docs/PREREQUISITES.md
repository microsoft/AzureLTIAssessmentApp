## Prerequisites

To begin, you will need:
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest?WT.mc_id=ltiAssessment-github-cxa)
* [.NET Core SDK](https://dotnet.microsoft.com/download?WT.mc_id=lti-github-cxa)
* [Node.js](https://nodejs.org/en/download/)
* [PowerShell](https://docs.microsoft.com/en-gb/powershell/scripting/install/installing-powershell?view=powershell-7.1&viewFallbackFrom=powershell-7%3FWT.mc_id%3DltiAssessment-github-cxa)
* [Git](https://git-scm.com/downloads)
* [Azure Subscription](https://azure.microsoft.com/free?WT.mc_id=ltiAssessment-github-cxa)

## Useful acronyms

* **LMS** - Learning Management System - a software platform that helps to create, manage, and deliver learning courses. For example, Moodle, Open edX, Canvas, Blackboard and others.
* **LTI** - Learning Tools Interoperability - an education technology, which specifies a method for a learning system to invoke and to communicate with external applications. For example, [Assessment App](https://github.com/microsoft/AzureLTIAssessmentApp) and [Learn LTI](https://github.com/microsoft/Learn-LTI) applications use LTI protocol to connect with LMS.

## How to get started?

1. Make sure that you installed one of the LMS for demonstration and testing purposes.
2. Use the [Deployment Guide](/docs/DEPLOYMENT_GUIDE.md) to deploy the Assessment App on your Azure Subscription.
3. Use the [Configuration Guide](/docs/CONFIGURATION_GUIDE.md) to configure the Assessment App in your LMS.
4. Get familiar with application's [architecture](/images/architecturediagram.png), [Educator Guide](/docs/EDUCATOR_GUIDE.md) and [Student Guide](/docs/STUDENT_GUIDE.md) to learn more about how the application works.

A video overview of the Assessment App interface can be found [here](https://youtu.be/XiIGph3-LdM).

## How to install LMS?

Currently, the Assessment App is compatible with [Moodle LMS](https://moodle.org/). However, you are welcome to contribute in order to add compatibility with other LMS.

### Moodle LMS
You are free to use any Moodle distribution. For example, you can consider using [Bitnami LMS Powered By MoodleTM LMS For Microsoft Azure](https://docs.bitnami.com/azure/apps/moodle/). 

**How to install Moodle Bitnami:**

1. Go to the Azure Portal: https://portal.azure.com/#home.
2. Search for "Marketplace".
3. Search for "Moodle Bitnami" on the Azure Marketplace page and choose one of the available versions.

### Open edX LMS

Currently, the Assessment App is NOT compatible with [Open edX](https://open.edx.org/). However, you are welcome to contribute to make the Assessment App compatible with Open edX.
You are free to use any Open edX distribution. For example, you can consider using [Tutor: the docker-based Open edX distribution](https://docs.tutor.overhang.io/).

To install Tutor, follow the [Quickstart (1-click install)](Quickstart (1-click install)) instructions.

## Useful resourses:

Here is a list of resourses which can help to learn more about possible usage of LTI protocol:

* [IMS LTI® 1.3 and LTI Advantage](https://www.imsglobal.org/activity/learning-tools-interoperability).
* [LTI Advantage: Learning Innovation at the Speed of Now](https://www.imsglobal.org/lti-advantage-overview).
* [LTI Advantage Libraries for .NET](https://github.com/LtiLibrary/LtiAdvantage).
