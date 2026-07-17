---
sidebar_position: 1
sidebar_label: Intro to DevPortal
title: Intro to DevPortal
---

import style from './style.module.css';
import DocCard from '@site/src/components/DocCard';

# Intro

:::note Running the older split-image release?
These docs cover **V2**, the unified `veecode/devportal:2.2.0` image driven by composable presets — the current default. If you still run **V1** (the split image `veecode/devportal-base` + `veecode/devportal`, profiles via `VEECODE_PROFILE`), see the [V1 documentation](/devportal/v1/intro). Not sure which you run? See [Which version am I running?](./which-version.md).
:::

Welcome to VeeCode Developer Portal documentation. This guide covers installation, plugins, and concepts for running DevPortal on your infrastructure.

### What is VeeCode DevPortal?

VeeCode DevPortal is an open-source platform built on top of [Backstage](https://backstage.io), an open-source developer portal framework created by Spotify. Backstage has a growing community and is being used by many organizations, including large technology companies like Google, Microsoft, and Verizon.

VeeCode DevPortal is a Backstage distro that provides a production-grade portal on day one: catalog, software templates, tech docs, search, and SSO already wired.

### Here are some key points about the Developer Portal

- It is a powerful tool that helps developers' self-service experience when developing APIs and services
- It is a catalog of software and IaC templates for autonomous teams to use
- It is an API showcase and governance tool for both developers and business partners
- It simplifies DevOps adoption and scaling, removing cognitive load from average teams

If you want to understand **why** this portal matters before diving into setup — the reasoning behind golden paths, self-service design, and developer autonomy — start with [Platform Concepts](/platform/intro). If you're here to install and configure, continue below.

<div className={style.wrapper}>

<DocCard title="💻 Installation Guide" link="/devportal/installation-guide" style={style}>Learn how to install the Developer Portal on your own infrastructure.</DocCard>

<DocCard title="💡 Concepts" link="/devportal/concepts/catalog" style={style}>Understand the core concepts and terminology related to the Developer Portal.</DocCard>

<DocCard title="🧩 Plugins" link="/devportal/plugins" style={style}>Enable and configure plugins to extend DevPortal with Day-2 capabilities.</DocCard>

<DocCard title="📍 Troubleshooting" link="/devportal/troubleshooting" style={style}>Find solutions to common issues and learn how to report errors.</DocCard>

</div>

By the end of this guide, you should have a good understanding of how the Developer Portal works and how it can help you better manage your API and service ecosystem. Let's get started!
