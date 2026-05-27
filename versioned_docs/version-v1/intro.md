---
sidebar_position: 1
sidebar_label: Intro to DevPortal
title: Intro to DevPortal
---

import style from './style.module.css';

# Intro

:::tip
This documentation is being updated to our latest release supporting dynamic plugins. Keep in touch and, by all means, file PRs to help us improve it.
:::

Welcome to VeeCode Developer Portal documentation! This document will guide you through our Developer Portal, which is a modern and open-source Platform Engineering solution designed to help organizations better manage their API and service ecosystems.

### What is VeeCode DevPortal?

VeeCode DevPortal is an open-source platform built on top of [Backstage](https://backstage.io), an open-source developer portal framework created by Spotify. Backstage has a growing community and is being used by many organizations, including large technology companies like Google, Microsoft, and Verizon.

VeeCode DevPortal is a Backstage distro that provides a production-grade portal on day one: catalog, software templates, tech docs, search, and SSO already wired.

### Here are some key points about the Developer Portal

- It is a powerful tool that helps developers' self-service experience when developing APIs and services
- It is a catalog of software and IaC templates for autonomous teams to use
- It is an API showcase and governance tool for both developers and business partners
- It simplifies DevOps adoption and scaling, removing cognitive load from average teams

This documentation guide aims to help you understand the workings of the Developer Portal, how to use it, and how to customize it to meet your specific needs. Here are some of the topics covered in this guide:

<div className={style.wrapper}>

export const Card = ({children, title, link}) => (
   <div className={style.card}
      onClick={() => window.location = link }
      onKeyDown={(e) => e.key === 'Enter' && (window.location = link)}
      tabIndex={0}
      role="button"
      aria-label={`Navigate to ${title}`}>
      <div className={style.titlebar}>
         <h3 className={style.title}>{title}</h3>
      </div>
      <p className={style.desc}>
         {children}
      </p>
   </div>
);

<!-- <Card title="📄️ Self-Service Demo" link="self-service-demo/prerequisites">Explore the platform's features through a simple interactive demo.</Card> -->

<Card title="💻 Installation Guide" link="/devportal/installation-guide/simple-setup">Learn how to install the Developer Portal on your own infrastructure.</Card>

<Card title="💡 Concepts" link="/devportal/concepts/catalog">Understand the core concepts and terminology related to the Developer Portal.</Card>

<!-- <Card title="🌐 API Management" link="/devportal/api-management/apiManagement">Effectively manage your APIs and services using the Developer Portal.</Card> -->

<Card title="🧩 Plugins" link="/devportal/plugins/techdocs">Customize and extend the functionality of your Developer Portal.</Card>

<Card title="📍 Troubleshooting" link="/devportal/troubleshooting">Find solutions to common issues and learn how to report errors.</Card>

</div>

By the end of this guide, you should have a good understanding of how the Developer Portal works and how it can help you better manage your API and service ecosystem. Let's get started!
