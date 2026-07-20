// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

//const lightCodeTheme = require("prism-react-renderer/themes/github");
//const darkCodeTheme = require("prism-react-renderer/themes/dracula");
import { themes as prismThemes } from 'prism-react-renderer';

// Base of the GitHub tree used for "Edit this page" links. Docs edits land on
// the develop branch (the editable base per CLAUDE.md).
const GITHUB_DOCS_TREE = "https://github.com/veecode-platform/docs/tree/develop";

// editUrl for non-versioned instances. The function form gives us the docs dir
// (relative to repo root, i.e. the plugin `path`) plus the file path, so the
// generated link resolves to the exact source file regardless of instance.
const editUrl = ({ versionDocsDirPath, docPath }) =>
  `${GITHUB_DOCS_TREE}/${versionDocsDirPath}/${docPath}`;

// editUrl for the versioned devportal instance. V1 (versioned_docs/version-v1)
// is frozen (correctness-only), so we omit its edit link; V2 (current) points
// at the develop source tree.
const devportalEditUrl = ({ version, versionDocsDirPath, docPath }) =>
  version === "v1"
    ? undefined
    : `${GITHUB_DOCS_TREE}/${versionDocsDirPath}/${docPath}`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "VeeCode Platform Documentation",
  staticDirectories: ["static"],
  tagline: "Access the comprehensive documentation for VeeCode Platform, covering the DevPortal and Admin-UI. Learn how to effectively use these powerful tools to build and deploy your applications with ease.",
  url: "https://docs.platform.vee.codes/",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  onBrokenAnchors: "throw",
  favicon: "img/favicon.ico",
  organizationName: "veecode-platform", // Usually your GitHub org/user name.
  projectName: "VeeCode Platform Services", // Usually your repo name.
  // MDX v3 mais tolerante
  // markdown: {
  //   format: "detect",
  // },
  // Internationalization
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
    localeConfigs: {
      en: {
        htmlLang: "en",
      },
    },
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({

        // https://docusaurus.io/docs/docs-multi-instance
        docs: {
          // id: 'product', // omitted => default instance
          path: "devportal",
          routeBasePath: "devportal",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: devportalEditUrl,
          showLastUpdateTime: true,
          // V2 (the unified devportal-platform image, driven by presets) is the
          // default, served at the root (/devportal/). V1 is the prior
          // split-image line, kept at /devportal/v1/ for installs still on it.
          lastVersion: "current",
          versions: {
            current: { label: "v2", path: "", banner: "none" },
            "v1": { label: "v1", path: "v1", banner: "unmaintained" },
          },
        },
        // docs: {
        //   sidebarPath: require.resolve('./sidebars.js'),
        //   // Please change this to your repo.
        //   editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: 'platform', // omitted => default instance
        path: "platform",
        routeBasePath: "platform",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl,
        showLastUpdateTime: true,
        // ... other options
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: 'admin-ui', // omitted => default instance
        path: "admin-ui",
        routeBasePath: "admin-ui",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl,
        showLastUpdateTime: true,
        // ... other options
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: 'vkdr', // omitted => default instance
        path: "vkdr",
        routeBasePath: "vkdr",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl,
        showLastUpdateTime: true,
        // ... other options
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/devportal/installation-guide/VKDR',
            to: '/devportal/installation-guide/vkdr-local/vkdr-setup'
          },
          {
            from: '/devportal/installation-guide/local-setup/vkdr-setup',
            to: '/devportal/installation-guide/vkdr-local/vkdr-setup'
          },
          {
            from: '/devportal/installation-guide/local-setup/docker-setup',
            to: '/devportal/installation-guide/docker-local/intro'
          },
        ],
        // V2 is now served at the root (/devportal/). Preserve the preview-era
        // links that circulated under /devportal/v2/… by redirecting each V2
        // page from its old /devportal/v2/ path. V1 pages (/devportal/v1/…) and
        // the other doc instances are left untouched.
        createRedirects(existingPath) {
          if (
            existingPath.startsWith("/devportal/") &&
            !existingPath.startsWith("/devportal/v1/")
          ) {
            return [existingPath.replace("/devportal/", "/devportal/v2/")];
          }
          return undefined;
        },
      },
    ],
    'docusaurus-plugin-image-zoom',
    require.resolve('./plugins/mcp-snapshot'),
    // llms.txt / llms-full.txt for AI crawlers. Covers the four current doc
    // instances; the frozen V1 tree (versioned_docs/version-v1) is excluded to
    // avoid duplicating the devportal content.
    [
      'docusaurus-plugin-llms',
      {
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        docsDir: [
          { path: 'devportal', routeBasePath: 'devportal', label: 'DevPortal' },
          { path: 'platform', routeBasePath: 'platform', label: 'Platform' },
          { path: 'admin-ui', routeBasePath: 'admin-ui', label: 'Admin-UI' },
          { path: 'vkdr', routeBasePath: 'vkdr', label: 'VKDR-CLI' },
        ],
        title: 'VeeCode Platform Documentation',
        description: 'Documentation for VeeCode DevPortal, Admin-UI, Platform and VKDR-CLI.',
      },
    ],
    // "Copy page as Markdown" / "Open in ChatGPT/Claude" button. Emits a .md
    // route per page (generateMarkdownRoutes) so the AI links have real
    // markdown to point at.
    [
      'docusaurus-plugin-copy-page-button',
      {
        generateMarkdownRoutes: true,
        markdownUrl: true,
        enabledActions: ['copy', 'view', 'chatgpt', 'claude'],
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Platform",
        logo: {
          alt: "VeeCode Logo",
          src: "img/veecodelogo.png",
        },
        items: [
          // {
          //   type: "doc",
          //   docId: "intro",
          //   position: "left",
          //   label: "safira-cli",
          // },
          // {
          //   type: "doc",
          //   docId: "intro",
          //   position: "left",
          //   label: "vkpr",
          // },
          // { to: '/platform/intro', label: 'Platform', position: 'left' },
          { to: '/devportal/intro', label: 'Devportal', position: 'left' },
          { to: '/admin-ui/intro', label: 'Admin-UI', position: 'left' },
          { to: '/vkdr/intro', label: 'VKDR-CLI', position: 'left' },
          // { to: '/safira-cli/intro', label: 'Safira-CLI', position: 'left' },
          // {
          //   type: 'localeDropdown',
          //   position: 'right',
          // },
          {
            type: "docsVersionDropdown",
            docsPluginId: "default",
            position: "right",
          },
          {
            href: "https://github.com/veecode-platform/support",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Website",
            items: [
              {
                label: "Veecode Platform",
                to: "https://platform.vee.codes/",
              },
            ],
          },
          {
            title: "Social",
            items: [
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/showcase/veecode-platform/",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/veecodeplatform",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Join our Comunity",
                href: "https://github.com/orgs/veecode-platform/discussions",
              },
              {
                label: "Contact Us",
                href: "https://platform.vee.codes/contact-us",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} VeeCode Platform, Inc. Built with Docusaurus.`,
      },
      prism: {
        additionalLanguages: ["bash"],
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      zoom: {
        selector: '.markdown img.zoomable',
        background: {
          light: 'rgb(255, 255, 255)',
          dark: 'rgb(50, 50, 50)'
        },
        config: {
          // options you can specify via https://github.com/francoischalifour/medium-zoom#usage
          margin: 24,        // Space around zoomed image
          scrollOffset: 0,   // Scroll offset
        }
      },
    }),
};

module.exports = config;
