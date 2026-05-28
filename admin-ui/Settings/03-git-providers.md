---
sidebar_position: 3
sidebar_label: Git Providers
title: Git Providers
---

import auth3 from "/img/AWSconfiguration/auth3.png"
import auth4 from "/img/AWSconfiguration/auth4.png"
import OAuth from "/img/AWSconfiguration/OAuth.png"
import choose from "/img/AWSconfiguration/choose.png"
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## How to Set Up Git Provider Integration

This guide explains how to integrate your **DevPortal** with a Git provider (such as GitHub, GitLab, or Azure DevOps) to facilitate catalog import and project generation.

## Steps

### Step 1: Access Git Provider Settings

1. **Open Admin UI**: Access the Admin UI of your DevPortal.
2. **Navigate to Git Providers**:
    - Click on **"Go to settings"** in the menu.
    - Select **“Git Providers”** from the sidebar menu.
![gitProviderGithub.jpeg](/img/AWSconfiguration/gitProviderGithub.jpeg)

### Step 2: Fill in Git Provider Information

1. **Enter the Required Data**:
    - Complete the fields based on your chosen Git provider (GitHub, GitLab, Azure DevOps). Below is a table with a description of each field:

| **Field** | **Description** |
| --- | --- |
| **Host** | The host location. Default is **github.com**. |
| **Token** | Authentication token for API and operations (anonymous access if not provided). |
| **Organization** | The name of your organization on GitHub. |
| **Catalog Path** | Path to the `catalog-info.yaml` file. |
| **Branch** | The branch you wish to use. |
| **Repository** | The repository you want to integrate with. |
| **Frequency** | Time (in minutes) for catalog update intervals. |
| **Timeout** | Time (in minutes) to automatically terminate after update requests. |
| **Client ID** | Your Client ID from the GitHub account. |
| **Client Secret** | Your Client Secret from the GitHub account. |

:::warning

For the full integration and operation of the DevPortal with GitHub, you should create and configure your authentication application(GitHub Oauth) and add the host that has been provided to you in the EC2 console.
**To configure your GitHub Oauth integration, please follow this [step-by-step guide](/devportal/integrations/GitHub/github-auth#step-1-create-a-github-oauth-app)**

:::

### Step 3: Preview the Configuration

1. After filling in the required fields, click on **"Preview"** in the left-hand menu to review the information.
![5.png](/img/AWSconfiguration/5.png)

### Step 4: Apply and Redeploy

1. On the **Preview** page, verify the information, then click on **"Apply and Re-deploy"** to apply the new Git provider settings and redeploy the application.

![6.png](/img/AWSconfiguration/6.png)

### Additional Important Information

- For complete integration with GitHub, you will need to create and configure a **GitHub OAuth** application.
- Add the host provided in the EC2 console when setting up the GitHub OAuth.
- Follow the detailed **GitHub OAuth** configuration guide to complete the setup process.




<!-- :::warning

For the full integration and operation of the DevPortal with GitHub, you should create and configure your authentication application(GitHub Oauth) and add the host that has been provided to you in the [EC2 console](../../devportal/installation-guide/AWS/AWSInstallation.mdx#7-access-the-ec2-console-and-if-the-instance-status-is-running-it-means-your-devportal-is-accessible-to-get-the-access-link-select-the-instance-where-you-have-installed-the-devportal-and-then-go-to-the-public-ipv4-address-option).
**To configure your GitHub Oauth integration, please follow this [step-by-step guide](/devportal/installation-guide/production-setup.md#create-a-new-github-oauth-app)**

::: -->


<!-- **Esclarecer com Luan essa etapa.**
1. Select "OAuth Apps" in  ["Developer Settings"](https://github.com/settings/developers) and then choose or criate the "OAuth App" for DevPortal authentication

<div style={{display: "flex", justifyContent: "space-between", gap:"1rem"}}>
  <img src={OAuth} alt="OAuth.png" width="35%" />
  <img src={choose} width="75%" />
</div> -->

  <!-- </TabItem> -->
  <TabItem value="GitLab" label="GitLab">
  | Field              | Description                                                                                                                                                                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **Host**  |The host of the GitLab instance. The default host is set to ‘gitlab.com’. Please note, it’s important not to include ‘https://’ or ‘http://’ in your input.  |
| **Token**  | An authentication token as expected by GitLab. The token need at least api, read_repository and write_repository scopes. If this is not supplied, anonymous access will be used.  |
| **Client Id**  | Your GitLab clientId. |
| **Client secret**  | The URL of the GitLab API. For self-hosted installations, it is commonly at https://host/api/v4. For Keycloak.com, this configuration is not needed as it can be inferred.  |
| **Api base url**  | The URL of the GitLab API. For self-hosted installations, it is commonly at `https://host/api/v4`. For gitlab.com, this configuration is not needed as it can be inferred. |
| **Branch**  | The branch you want to use.  |
| **Group**  | Group and subgroup (if needed) to look for repositories. If not present the whole instance will be scanned.|
| **File name**  | Catalog file path. |
| **Frequency**  | Time in minutes for catalog update.  |
| **Timeout**  | Time in minutes to timeout after the refresh request. |


During this step, we will configure AzureDevops as the authenticator for the platform.

 </TabItem>

<TabItem value="AzureDevops" label="Azure DevOps">
  | Field              | Description                                                                                                                                                                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **Host**  |The host of the GitLab instance. The default host is set to ‘gitlab.com’. Please note, it’s important not to include ‘https://’ or ‘http://’ in your input.  |
| **Token**  | An authentication token as expected by GitLab. The token need at least api, read_repository and write_repository scopes. If this is not supplied, anonymous access will be used.  |
| **Api base url**  | The URL of the GitLab API. For self-hosted installations, it is commonly at `https://host/api/v4`
| **Branch**  | The branch you want to use.  |
| **Group**  | Group and subgroup (if needed) to look for repositories. If not present the whole instance will be scanned.|
| **File name**  | Catalog file path. |
| **Frequency**  | Time in minutes for catalog update.  |
| **Timeout**  | Time in minutes to timeout after the refresh request. |


During this step, we will configure Keycloak as the authenticator for the platform.

 </TabItem>

<!-- </Tabs> -->

#### 3.After filling out the necessary information, click on “Preview” in the left-hand side menu.
![5.png](/img/AWSconfiguration/5.png)

#### 4. On the preview page, you can view all the set information and redeploy the application to upload the new settings. To do this, simply click on "Apply and Re-deploy".
![6.png](/img/AWSconfiguration/6.png)

