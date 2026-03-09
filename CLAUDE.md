# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog at blog.jiayihu.net built with Astro, using MDX for content and React for interactive components.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check (`astro check`) then build
- `npm run preview` — Preview production build
- `npm run deploy` — Deploy to GitHub Pages via gh-pages

No test or lint scripts are configured.

## Architecture

- **Framework**: Astro 4.x with MDX, React, Sitemap integrations
- **Content**: Blog posts in `src/content/blog/` as `.md`/`.mdx` files with typed frontmatter (title, description, pubDate required; cover, updatedDate optional)
- **Routing**: `src/pages/[...slug].astro` generates static pages from the blog content collection
- **Layouts**: `BlogPost.astro` (articles with reading time, Giscus comments) and `About.astro`
- **Styles**: Single `src/styles/global.css` using CSS custom properties, Bear Blog-inspired. No CSS framework.
- **Constants**: `src/consts.ts` holds site title and description
- **RSS**: Auto-generated at `/rss.xml` from blog collection

## Content Schema

Blog frontmatter defined in `src/content/config.ts`:
```yaml
title: string        # required
description: string  # required
pubDate: date        # required
cover: image         # optional, min 1200×630px
updatedDate: date    # optional
```

## Key Conventions

- Markdown plugins: remark-toc for auto table of contents
- Syntax highlighting: github-light theme
- Math formulas: KaTeX via `Latex.astro` component
- Image zoom: `ZoomableImage.astro` wraps react-medium-image-zoom
- Comments: Giscus (GitHub discussions, repo: jiayihu/blog, mapping by title)
- TypeScript: strict mode (extends `astro/tsconfigs/strict`)
