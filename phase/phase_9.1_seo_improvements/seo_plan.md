# Phase 9.1: SEO Improvement Plan

This document outlines a phased approach to improving the Search Engine Optimization (SEO) for the `free-nz-maths` website, making its valuable content more discoverable by search engines like Google.

## Goal

To increase organic search traffic by ensuring that individual topics, skills, and NCEA past paper content can be indexed and ranked effectively by search engines.

---

### Phase 1: Foundational On-Page SEO (Low Effort, High Impact)

This phase focuses on core on-page elements that are critical for search engines to understand the content of each page.

1.  **Dynamic Page Titles:**
    *   **Problem:** As a Single-Page App, the site likely has a single `<title>` tag in `index.html`, which is not descriptive for specific topics.
    *   **Action:** Implement logic in the main `App.jsx` component to dynamically update the document title based on the user's current view.
    *   **Example:** When a user is practicing "Pythagoras' Theorem", the page title should change from "Free NZ Maths" to "Practice Pythagoras' Theorem | Free NZ Maths". This can be achieved with a `useEffect` hook in React.

2.  **Dynamic Meta Descriptions:**
    *   **Problem:** The site is missing unique meta descriptions for each topic, which are crucial for search engine result snippets.
    *   **Action:** Add a `<meta name="description" ...>` tag to `index.html`. Similar to the title, create a mechanism to dynamically update its `content` attribute. The content for this can be pulled from the `summary` field of our new `src/knowledgeSnippets.json` file.

3.  **Use of Semantic HTML:**
    *   **Problem:** Content may be structured using generic `<div>` tags, which provide no semantic meaning to search crawlers.
    *   **Action:** Review key components (e.g., `App.jsx`, `CurriculumMap.jsx`) and replace non-semantic tags with appropriate header tags (`<h1>`, `<h2>`, `<h3>`) and other semantic elements (`<nav>`, `<main>`, `<section>`). For example, the main topic name on a practice page should be an `<h1>`.

---

### Phase 2: Content Discoverability (Technical SEO)

This phase ensures that search engines can find and crawl all the individual "pages" or topics on the site.

1.  **Implement Client-Side Routing:**
    *   **Problem:** The app likely switches between views internally without changing the URL. This means search engines see it as a single page.
    *   **Action:** Introduce a routing library like **`react-router-dom`**. This will allow us to assign a unique, shareable URL to each topic and NCEA paper.
    *   **Example URLs:**
        *   `/practice/Y9.G.PYTHAGORAS_SOLIDS`
        *   `/ncea/paper/2022/91028`

2.  **Generate a `sitemap.xml`:**
    *   **Problem:** Without a sitemap, search engines have to discover pages by following links, which can be inefficient for a large site.
    *   **Action:** Create a script (e.g., `scripts/generate_sitemap.mjs`) that runs as part of the build process (`npm run build`).
    *   **Logic:** The script will:
        1.  Read all skill IDs from `src/curriculumDataFull.json` and `src/curriculumDataNew.json`.
        2.  Read all NCEA paper IDs from the future `src/pastPapersData.js`.
        3.  Generate a `sitemap.xml` file containing a URL for every topic and every paper, following the structure from the routing implementation.
        4.  Save the sitemap to the `public/` directory so it gets deployed with the site.

---

### Phase 3: Content Strategy for NCEA Papers

This phase focuses on making the high-value NCEA content SEO-friendly.

1.  **Leverage Transcribed JSON Data:**
    *   **Insight:** The current plan to transcribe NCEA PDFs into JSON is **excellent for SEO**. PDF content is difficult for search engines to index, whereas the JSON content can be rendered as standard HTML text, which is easily crawlable.

2.  **Create Static Pages for Each Paper:**
    *   **Action:** Using the routing from Phase 2, ensure that each NCEA past paper has its own dedicated URL (`/ncea/paper/2022/91028`).
    *   **Benefit:** This allows search engines to index each past paper as a unique, high-value piece of content, making it likely to rank for searches like "NCEA Level 1 Maths 91028 2022".

---

### Phase 4: Advanced - Server-Side Rendering (SSR)

This is a longer-term, high-impact recommendation for maximum SEO performance.

1.  **The Problem with Client-Side Rendering (CSR):**
    *   Your React/Vite app is likely a CSR application. This means the initial HTML sent to the browser (and search engine crawler) is a nearly empty shell. The content is loaded and rendered afterwards using JavaScript.
    *   While Google is better at executing JavaScript, it's not perfect, and it can lead to slower indexing or missed content.

2.  **The Solution - Server-Side Rendering (SSR):**
    *   SSR involves rendering the React components on the server *before* sending the page to the user. This means the crawler receives a fully-formed HTML page with all the content, which is ideal for SEO.
    *   **Recommended Action:** Investigate using **`vite-plugin-ssr`** to add SSR capabilities to the existing Vite project, or consider a future migration to a meta-framework like **Next.js**, which has SSR built-in.

3.  **Priority:** This is a significant architectural change. It should be considered **after** Phases 1, 2, and 3 are complete, as they provide the most immediate value for the effort involved.
