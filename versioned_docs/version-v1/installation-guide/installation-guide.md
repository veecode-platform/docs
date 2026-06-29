---
sidebar_position: 0
sidebar_label: Installation Guides
title: Installation Guides
---

You can use VeeCode DevPortal for free in many possible ways. Find here a few setup guides to get started. We definitely recommend you going through them to learn a few concepts along the way.

:::info
**VeeCode DevPortal** is "[free as in speech](https://www.gnu.org/philosophy/free-sw.html)" software. It preserves the same OSS license of Backstage itself ([Apache License](https://www.apache.org/licenses/LICENSE-2.0)), so you are free to use, modify and distribute it.
:::

import style from '../style.module.css';
import DocCard from '@site/src/components/DocCard';

<div className={style.wrapper}>

<DocCard title="Docker Run (Quickstart)" link="./docker-local/intro" style={style}>Quickly run DevPortal locally using Docker. Ideal for testing and exploration without Kubernetes.</DocCard>

<DocCard title="VKDR (Local Kubernetes)" link="./vkdr-local/vkdr-setup" style={style}>Install DevPortal locally on a lightweight Kubernetes cluster using VKDR. Best for reproducing production scenarios.</DocCard>

<DocCard title="Simple Setup" link="./simple-setup" style={style}>Learn how to install a self-hosted Developer Portal with a simple setup (trial, demo or small production environment).</DocCard>

<DocCard title="Production Setup" link="./production-setup" style={style}>Learn how to install a self-hosted and production-ready Developer Portal on your own infrastructure.</DocCard>

<DocCard title="Customization" link="/devportal/v1/customization" style={style}>Learn how to customize your Developer Portal.</DocCard>

<DocCard title="FAQs" link="./FAQs" style={style}>Frequently Asked Questions.</DocCard>

</div>
