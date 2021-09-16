# Azure LTI Assessment Application

## About

Most modern Learning Management systems (LMS), such as [Moodle](https://moodle.org/), [Blackboard](https://www.blackboard.com) and [Canvas](https://www.instructure.com/canvas), support extensions using [LTI protocol](https://www.imsglobal.org/activity/learning-tools-interoperability) - an education technology, which represents a method for a learning system to connect with external applications.

**Azure Assessment App** is an LTI extension, implemented as a web application, which can be integrated into LMS using LTI protocol to allow Educators to easily create and manage assessments.

The Assessment App aims to reduce time spent by Educators on assessment management because it works independently from any LMS, provides a unified user interface and eliminates the need to transfer the questions from one format to another when switching between different LMS.

The project was completed as a part of Microsoft and University College London Industry Exchange Network ([UCL IXN](https://www.ucl.ac.uk/computer-science/collaborate/ucl-industry-exchange-network-ucl-ixn)) [Victoria Demina](https://github.com/victoriademina) under supervision of Dr. Graham Roberts (UCL) and Lee Stott (Microsoft) building of the [Microsoft Learn LTI](http://github.com/microsoft/learn-lti) Open Source Solution

## Key Features:

* **Single Sign-On (SSO)** - to access the Assessment App, users only need to sign into their institution’s LMS.
* **Participants and Grading** - the Assessment App securely retrieves the course participants from LMS and returns their grades back to LMS grade book.
* **Assessment Analytics** - illustrative insights for educators.

## Architecture 

![Architecture](/images/architecturediagram.png)

## Table of content:

1. [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
2. [Configuration Guide](./docs/CONFIGURATION_GUIDE.md)
3. [Educator Guide](./docs/EDUCATOR_GUIDE.md)
4. [Student Guide](./docs/STUDENT_GUIDE.md)

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow [Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).

Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
