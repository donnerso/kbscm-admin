# Keebyte SCM Admin

Keebyte SCM Admin is a Vue 2 based administration console for the Keebyte supply chain management system. It provides the front-end workspace for SCM business operations, system administration, permission management, monitoring, deployment tools, and common back-office utilities.

The application is designed to work with a backend service that provides authentication, user information, dynamic menu routes, and REST APIs. Most business pages are loaded through backend-driven menu configuration, so the visible navigation depends on the current user's roles and permissions.

## Features

- SCM master data management, including parts, part categories, warehouses, stock locations, and work centers.
- Purchase and supplier management, including supplier accounts and invoice information.
- Sales and customer management, including customer accounts and invoice information.
- Inventory workflows for receipt notes and outbound orders.
- System administration for users, departments, jobs, roles, and menus.
- Operational tools such as logs, online users, server monitoring, SQL monitoring, scheduled tasks, storage settings, email, Alipay, Swagger, code generation, and deployment management.
- Reusable CRUD components for table-based management pages.
- Dashboard charts built with ECharts.

## Tech Stack

- Vue 2.6
- Vue Router 3
- Vuex 3
- Element UI 2
- Axios
- ECharts
- Vue CLI 3
- Sass
- Jest

## Project Structure

```text
src/
  api/                 API clients grouped by business area
  assets/              Global styles, images, and SVG icons
  components/          Shared UI components and CRUD helpers
  layout/              Main admin layout
  router/              Static routes and dynamic route registration
  store/               Vuex modules for user, permissions, settings, and UI state
  utils/               Request, auth, validation, upload, and general utilities
  views/
    cms/               CMS pages
    scm/               SCM business pages
    system/            System administration and operations pages
    dashboard/         Dashboard chart components
```

## Requirements

The project uses an older Vue CLI toolchain. The declared engine requirement is:

```text
Node.js >= 8.9
npm >= 3.0.0
```

For modern local development, use a Node.js version that remains compatible with Vue CLI 3 and the project's dependency lockfile.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The development server is configured in `vue.config.js` and listens on port `8013` by default.

The default development API target is configured in `.env.development`:

```text
VUE_APP_BASE_API=http://localhost:8000
VUE_APP_WS_API=ws://localhost:8000
```

During development, requests under `/api` and `/auth` are proxied to `VUE_APP_BASE_API`.

## Build

Build for production:

```bash
npm run build:prod
```

Build with the staging mode:

```bash
npm run build:stage
```

The production output is written to `dist/`.

## Authentication and Routes

Authentication is handled through the backend endpoints under `auth/*`. After login, the frontend stores the returned token and sends it in the `Authorization` header for API requests.

The application only defines a small set of static routes locally, such as login, dashboard, error pages, redirect, and the user center. Business routes are loaded from the backend through `api/menus/build`, transformed into Vue Router route records, and registered at runtime.

This means new business pages usually require both:

- a Vue component under `src/views`
- a matching backend menu entry that points to that component path

## Available Scripts

```bash
npm run dev          Start the local development server
npm run build:prod   Build the production bundle
npm run build:stage  Build with staging mode
npm run preview      Preview the built application
npm run lint         Run ESLint on source files
npm run test:unit    Run unit tests
npm run svgo         Optimize SVG icons
npm run new          Generate files with Plop
```

## Notes

This repository contains the frontend application only. A compatible backend service is required for login, permissions, dynamic menus, and all SCM/system API data.
