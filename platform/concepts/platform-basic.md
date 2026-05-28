---
sidebar_position: 1
sidebar_label: What is a Developer Platform
title: What is a Developer Platform
---

import style from '../style.module.css';

# What is an Internal Developer Platform?

An **Internal Developer Platform (IDP)** is a curated set of tools, services, and workflows that enables development teams to autonomously deliver software with minimal cognitive load and maximum velocity. It serves as the foundation layer that abstracts away infrastructure complexity while providing self-service capabilities for developers.

## Core Definition

An Internal Developer Platform (IDP) is fundamentally about reducing cognitive load on stream-aligned product teams (as defined in [Team Topologies](../references/team-topologies.md)) by providing the thinnest viable platform. This allows teams to **focus on business logic and outcomes**, instead of wrestling with infrastructure and operational concerns.

The Platform serves as a digital foundation that:

- Offers self-service capabilities for common development and operational tasks
- Abstracts infrastructure complexity through well-designed APIs and golden paths
- Accelerates flow of change from development to production, improving deployment frequency and reducing lead time
- Improves quality and consistency by embedding best practices directly into the platform
- Removes friction that typically slows down teams, so they can focus on innovation rather than tooling or compliance overhead
- Reduces the burden on product teams to become experts in every underlying technology

## Key Characteristics

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

<Card title="Self-Service by Design" link="./self-service-design">
Following the principles from Cloud Native Transformation, an IDP must be:
- **Developer-centric**: Built with the developer experience as the primary concern
- **API-driven**: Everything accessible through well-documented APIs
- **Automated**: Manual processes are eliminated wherever possible
- **Observable**: Provides clear visibility into system state and performance
</Card>

<Card title="Cognitive Load Reduction" link="./cognitive-load-reduction">
Based on Team Topologies principles:
- **Intrinsic load**: Focuses on the fundamental aspects of the problem domain
- **Extraneous load**: Eliminates unnecessary complexity in tools and processes  
- **Germane load**: Provides patterns and templates that accelerate learning
</Card>

<Card title="Platform as a Product" link="./platform-as-product">
The platform team treats the IDP as a product with:
- **Clear customer focus**: Stream-aligned teams are the customers
- **Product thinking**: Continuous improvement based on user feedback
- **Service level objectives**: Measurable commitments to reliability and performance
- **Documentation and support**: Comprehensive onboarding and troubleshooting resources
</Card>

<Card title="Business Outcomes" link="./business-outcomes">
Platforms deliver measurable business value through:
- **Accelerated time-to-market**: 2-5x improvement in deployment frequency and feature delivery speed
- **Cost optimization**: 20-40% reduction in infrastructure costs through automation and efficiency
- **Developer productivity**: 2-10x improvement in individual and team velocity metrics
- **Competitive advantage**: Enhanced ability to innovate and respond to market opportunities
</Card>
</div>

## Platform Components

To achieve these outcomes, the platform relies on key architectural concepts:

<div className={style.wrapper}>

<Card title="Golden Paths" link="./golden-paths">
Opinionated, supported paths to production that reduce decision fatigue and enforce best practices.
</Card>

<Card title="Blueprints" link="./blueprints">
Reference implementations and architectural patterns for building complex systems on the platform.
</Card>

</div>

## Conclusion

An Internal Developer Platform is not just a collection of tools—it's a **strategic capability** that enables organizations to achieve the fast flow of change essential for competitive advantage in the digital economy. By applying [Team Topologies](../references/team-topologies.md) principles and cloud native patterns, an IDP becomes the foundation that allows development teams to focus on what matters most: delivering value to customers.

The key to success lies in maintaining the balance between providing powerful capabilities while keeping cognitive load low, treating the platform as a product, and continuously evolving based on the needs of stream-aligned teams.
