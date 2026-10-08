---
sidebar_position: 1
sidebar_label: Intro
title: DevPortal 3.x documentation
---

import style from './style.module.css';
import DocCard from '@site/src/components/DocCard';

# Intro

:::note Looking for the 2.x documentation?
Go to the [DevPortal 2.x documentation](/devportal/v2/intro).
:::

Welcome to VeeCode Developer Portal documentation. This guide covers installation, plugins, and concepts for running DevPortal on your infrastructure.

## What is VeeCode DevPortal?

VeeCode DevPortal is an open-source platform built on top of [Backstage](https://backstage.io), an open-source developer portal framework created by Spotify. Backstage has a growing community and is being used by many organizations, including large technology companies like Google, Microsoft, and Verizon.

VeeCode DevPortal is a Backstage distribution. The 3.x default plugins include Home, Catalog, APIs, Docs, Self-service, Notifications, Tech Radar, and Marketplace. The image also ships TechDocs, Signals, and the RBAC screens. Permission checks stay off until you set `permission.enabled: true` in app configuration. Guest sign-in is enabled by default and maps to `user:default/admin`. The default install has no demo catalog or software templates. Set up a provider for user sign-in; the install guide uses Keycloak over OIDC.

## Key points about the Developer Portal

- It is a powerful tool that helps developers' self-service experience when developing APIs and services
- It is a catalog where autonomous teams can organize their own software and infrastructure-as-code (IaC) resources
- It is an API showcase and governance tool for both developers and business partners
- It simplifies DevOps adoption and scaling, removing cognitive load from average teams

If you want to understand why this portal matters before diving into setup, start with [Platform Concepts](/platform/intro). The page explains golden paths, self-service design, and developer autonomy. If you're here to install and configure, continue below.

<div className={style.wrapper}>

<DocCard title="💻 Installation Guide" link="/devportal/installation-guide" style={style}>Learn how to install the Developer Portal on your own infrastructure.</DocCard>

<DocCard title="💡 Concepts" link="/devportal/concepts/catalog" style={style}>Understand the core concepts and terminology related to the Developer Portal.</DocCard>

<DocCard title="🧩 Plugins" link="/devportal/plugins" style={style}>Enable and configure plugins to extend DevPortal with Day-2 capabilities.</DocCard>

<DocCard title="📍 Troubleshooting" link="/devportal/troubleshooting" style={style}>Find solutions to common issues and learn how to report errors.</DocCard>

</div>

By the end of this guide, you should have a good understanding of how the Developer Portal works and how it can help you better manage your API and service ecosystem. Let's get started!

## Start here

- Run a local portal with the [DevPortal 3.x quickstart](./installation-guide/docker-local/intro.md).
- Install on Kubernetes with the [DevPortal Helm chart](./installation-guide/production-setup/setup.md).
- Move an existing installation with the [2.x-to-3.x migration guide](./migrating-from-2x.md).
- Read the [3.x support policy](./support.md).
- Review the [3.x release sheets](./release-sheets/release-sheets.md).
