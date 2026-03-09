# New Blog Article

Create a new blog article for blog.jiayihu.net. The user will provide the topic: $ARGUMENTS

## File Setup

1. Create the markdown file at `src/content/blog/<slug>.md` (or `.mdx` if the article needs interactive components like ZoomableImage or Aside).
2. The slug should be lowercase, hyphenated, concise (e.g. `testing-observables-in-rxjs6.md`).
3. If the article includes images, create a directory at `src/content/blog/images/<slug>/` and reference images with relative paths like `./images/<slug>/image-name.png`.

## Frontmatter

Every article must have this frontmatter:

```yaml
---
title: Article Title Here
description: A single sentence summarizing the article, written as an invitation to read
pubDate: YYYY-MM-DD
cover: ./images/<slug>/cover.jpg  # optional, min 1200×630px
---
```

- `title`: Concise, descriptive. Can be a "How to..." or a noun phrase. No trailing period.
- `description`: One sentence, no period at the end. Should explain what the reader will learn or what the article covers.
- `pubDate`: Use today's date.
- `cover`: Only include if the user provides a cover image.

## MDX Setup (only for .mdx files)

If using `.mdx`, add these imports after the frontmatter:

```mdx
import Aside from '../../components/Aside.astro';
import ZoomableImage from '../../components/ZoomableImage.astro';
export const components = {img: ZoomableImage}
```

Use `<Aside>` for supplementary notes/tips that aren't part of the main flow.

## Writing Style

Match the existing blog's voice and tone by following these rules:

### Voice
- First person ("I", "we", "let's"), conversational but technically rigorous.
- Address the reader directly ("you") and guide them through the topic like a walkthrough.
- Write as if explaining to a knowledgeable colleague — skip basics, get to the point.
- Brief personal context is fine when it motivates the article (e.g. "a colleague and I were looking at..." or "I wrote this article to remind a future version of myself").

### Structure
- Open with a short intro (1-2 paragraphs) that sets context and states what the article covers. No preamble or fluff.
- Use `## Heading` for major sections. Headings are short noun phrases or questions.
- Use code blocks extensively with language tags (```typescript, ```css, etc.).
- After showing code, explain what it does and why. Walk through the key parts.
- Use inline `code` formatting for function names, variable names, CLI commands, file names, and technical terms on first mention.
- Link to external resources (MDN, GitHub repos, official docs) inline where relevant.
- End with a brief conclusion or a conversational closing (e.g. "What do you think of this strategy?", "I hope this guide cleared some mysteries...").

### Formatting Conventions
- Use **bold** for introducing key terms or important concepts on first mention.
- Use `<aside class="notice">` (in .md) or `<Aside>` (in .mdx) for tangential tips.
- Use `---` horizontal rule before a closing/sign-off section when appropriate.
- Images use markdown syntax: `![Alt text](./images/<slug>/image-name.png)`.
- Embed external demos via iframe when relevant (CodeSandbox, CodePen).
- Use blockquotes `>` sparingly, only for actual quotes or brief disclaimers at the top.

### What NOT to do
- Don't start with "In this article, we will..." — just dive in.
- Don't use bullet-point-heavy format for the main content; write in flowing paragraphs.
- Don't over-explain basic concepts that the target audience (experienced developers) already knows.
- Don't add emoji to the article content.
- Don't add a Table of Contents manually — remark-toc generates it automatically from a `## Table of Contents` heading if desired.

## After Creating the Article

- Confirm the file was created and show the frontmatter.
- If images are referenced, note that the user needs to add the actual image files to `src/content/blog/images/<slug>/`.
- Suggest running `npm run dev` to preview.
