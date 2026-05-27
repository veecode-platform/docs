---
sidebar_position: 6
sidebar_label: Access and Testing
title: Access and Testing
---

This section guides you through **accessing DevPortal locally** and testing its features, including the deployed sample applications and APIs.

## Steps Overview

In this section, you will:

1. **Test the PetClinic sample app** — Open the demo web application manually via URL to ensure it is running.
1. **Test the ViaCEP sample API** — Access the sample API manually via URL to verify it returns correct responses.
1. **Access DevPortal** — Open the DevPortal web interface in your browser.
1. **Explore the Catalog** — Browse components, sample apps, and APIs catalogued in DevPortal.
1. **Explore the APIs menu** — Check the list of APIs deployed in the cluster.
1. **Explore the Docs menu** — View the documentation components available for deployed apps and environment.
1. **Explore the Groups menu** — Inspect user groups and their roles/permissions in DevPortal.
1. **Explore the Create menu** — Browse templates for creating new components and optionally try creating one.
1. **Explore the Settings menu** — Check options for personal preferences and interface configuration.
1. **Explore the Clusters menu** — View the status and details of your local Kubernetes cluster.

## Step 1: Test the PetClinic Sample App

1. Open your browser and navigate to: [http://petclinic.localhost:8000/](http://petclinic.localhost:8000/)
1. You should see the PetClinic demo web application and be able to interact with it.

## Step 2: Test the ViaCEP Sample API

1. Open your browser (or use a tool like `curl` or Postman) and access the API via:
   `http://localhost:8000/cep/<cep-code>/json`
   Replace `<cep-code>` with a valid Brazilian postal code, for example: [http://localhost:8000/cep/01001000/json](http://localhost:8000/cep/01001000/json)
1. You should see the JSON response for the provided postal code.

## Step 3: Access DevPortal

1. Open your browser and navigate to [http://devportal.localhost:8000/](http://devportal.localhost:8000/)

### Enter as a Guest User

1. The first time you access DevPortal, you will see a screen with a button labeled **Enter as a guest user**. Click this button to continue. After clicking, you will access the main DevPortal interface.

## Step 4: Explore the Catalog

1. Click on `Catalog` in the sidebar.
1. You should see a list of components, including:
   - `PetClinic` — a demo web application.
   - `ViaCEP` — a sample API that retrieves address information for Brazilian postal codes (CEP).
1. Click on each component to view details and interact with its documentation.

## Step 5: Explore the APIs Menu

1. Click **APIs** in the sidebar.
1. You should see at least the following item:
   - `via-cep-apps` — representing the ViaCEP API component.
1. Click on it to explore the API details and documentation.

## Step 6: Explore the Docs Menu

1. Click **Docs** in the sidebar.
1. You should see the following documentation components:
   - `environment-vkdr-local`
   - `PetClinic`
   - `ViaCEP`
1. Click on each doc component to explore the associated documentation.

## Step 7: Explore the Groups Menu

1. Click **Groups** in the sidebar.
1. You should see three main groups:
   - `veecode (blue)` — internal VeeCode users.
   - `VeeCode` — organization-wide access group.
   - `admin` — administrative users.
1. These groups define permissions and roles for accessing DevPortal components and APIs.

## Step 8: Explore the Create Menu

1. Click **Create** in the sidebar.
1. You should see three templates available for creating new components:
   - `Github Pages Simple Blog Template`
   - `Spec Project`
   - `NextJS Template`
1. You can try creating a new component using one of these templates. Refer to the official Backstage documentation for detailed instructions: [Backstage Software Templates](https://backstage.io/docs/features/software-templates/)

## Step 9: Explore the Settings Menu

1. Click **Settings** in the sidebar.
1. You should see options for personal preferences and interface configuration.

## Step 10: Explore the Clusters Menu

1. Click **Clusters** in the sidebar.
1. You should see the cluster item:
   - `cluster-vkdr-local` — representing the local VKDR Kubernetes cluster.
1. Clicking it shows cluster status, nodes, and details.

---

This guide ensures you can verify that DevPortal is running correctly and interact with the sample applications, APIs, and other features for testing, learning, and exploration.

With these steps completed, your local DevPortal setup is fully operational. You are now ready to start exploring, testing, or developing components and workflows in your local environment, completing the **Local Setup** flow.
