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

<DocCard title="Docker Run (Quickstart)" link="/devportal/installation-guide/docker-local/intro" style={style}>Quickly run DevPortal locally using Docker. Ideal for testing and exploration without Kubernetes.</DocCard>

<DocCard title="VKDR (Local Kubernetes)" link="/devportal/installation-guide/vkdr-local/vkdr-setup" style={style}>Install DevPortal locally on a lightweight Kubernetes cluster using VKDR. Best for reproducing production scenarios.</DocCard>

<DocCard title="Production Setup (Kubernetes)" link="/devportal/installation-guide/production-setup" style={style}>Deploy DevPortal to a Kubernetes cluster using plain manifests — no Helm chart required.</DocCard>

<DocCard title="Customization" link="/devportal/customization" style={style}>Learn how to customize your Developer Portal.</DocCard>

<DocCard title="FAQs" link="/devportal/installation-guide/FAQs" style={style}>Frequently Asked Questions.</DocCard>

</div>
