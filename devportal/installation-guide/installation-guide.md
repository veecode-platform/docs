---
sidebar_position: 0
sidebar_label: Installation Guides
title: Installation Guides
---

import style from '../style.module.css';
import DocCard from '@site/src/components/DocCard';

# Choose an installation path

Use one of these guides to install or customize DevPortal 3.x.

<div className={style.wrapper}>

<DocCard title="Local quickstart" link="/devportal/installation-guide/docker-local/intro" style={style}>Run a local DevPortal 3.x portal with `devportal-local`.</DocCard>

<DocCard title="Kubernetes with Helm" link="/devportal/installation-guide/production-setup" style={style}>Install DevPortal on Kubernetes with the `devportal` Helm chart.</DocCard>

<DocCard title="Upgrade DevPortal 3.x" link="/devportal/installation-guide/production-setup/upgrade" style={style}>Upgrade an existing DevPortal 3.x installation.</DocCard>

<DocCard title="Migrate from 2.x" link="/devportal/migrating-from-2x" style={style}>Move a DevPortal 2.x installation to 3.x.</DocCard>

<DocCard title="Customization" link="/devportal/customization" style={style}>Customize DevPortal for your platform.</DocCard>

<DocCard title="FAQs" link="/devportal/installation-guide/FAQs" style={style}>Find answers to common installation questions.</DocCard>

</div>

VKDR installs DevPortal 2.x only; its guide is in the 2.x docs at [VKDR setup](/devportal/v2/installation-guide/vkdr-local/vkdr-setup), and a local 3.x portal runs with `devportal-local`.
