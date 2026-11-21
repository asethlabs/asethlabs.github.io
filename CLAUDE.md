# Annie Seth personal site

A static site (plain HTML, CSS and JS, no build step) hosted on GitHub Pages from the `main` branch root. Pushing to `main` publishes the site, usually within a minute.

## Pages
- `index.html`: home page with the intro, About section and education
- `work.html`: roles at Microsoft and AT&T
- `projects.html`: side projects (JARVIS, research portfolio). Swap out the dashed "Next project" card when something new ships.
- `discoveries.html`: log of industry learnings. Add new entries at the **top** of the list, copying an existing `<div class="role">` block: title, `when` label (company/project or date), body, a one-line takeaway, and 1–3 tags.
- `hobbies.html`: tabs rendered from `hobbies-data.js`. To update hobbies, edit only the `HOBBIES` array in `hobbies-data.js`. Add updates newest first as `{ date: "YYYY-MM-DD", title: "...", text: "..." }`. An update can take `media: [{ src: "media/<hobby>/file.jpg", alt: "..." }]` for photos and videos (files go in `media/<hobby>/`; keep photos under ~500 KB and videos well under GitHub's 100 MB file limit). The page works like a feed: an "All" tab (built automatically) shows every hobby's updates newest first.
- `contact.html`: email, LinkedIn, GitHub and location

## Rules
- Keep the existing design in `style.css` (Fraunces / Inter / JetBrains Mono, paper and accent colors, light and dark mode). Don't restyle unless Annie asks.
- Every page shares the same `<nav>` and `<footer>`. A new page needs the nav link added to every HTML file, with `aria-current="page"` on its own link.
- Write in Annie's voice: first person, plain and direct.
- Annie works at Microsoft. Don't add internal project details, metrics or names she hasn't already approved for the site. Ask if unsure.
- Before editing, pull the latest `main` so changes made from another session aren't overwritten.
- Check that pages still work at phone width (around 375px).
