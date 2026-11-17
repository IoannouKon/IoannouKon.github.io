# Konstantinos Ioannou — portfolio redesign (review build)

A personal, responsive, no-build static website with a dedicated, extensible **My Projects** index, plus RISC-V, accelerator design, open-source contributions, and an engineering background.

## Preview

Open `index.html` in a browser, or for a more accurate local preview:

```bash
python3 -m http.server 8000
```

Visit `http://localhost:8000` (or `http://localhost:8000/projects.html` for the growing project collection).

## Files

- `index.html`: main introduction, project cards, background and contact.
- `projects.html`: expanding project hub, beginning with LUMIXED and clearly labeled space for future designs.
- `about.html`: personal story, professional/independent work and interests.
- `lumixed.html`: technical project page and architecture walkthrough.
- `style.css`: responsive visual design.
- `script.js`: menu, interactive architecture selector, copy-email buttons (if used) and viewport transitions.
- `favicon.svg`, `404.html`, `.nojekyll`, `.github/workflows/deploy.yml`: metadata and deployment.

The three schematic images on the LUMIXED page are **original figures** loaded from the public `IoannouKon/LUMAX` GitHub repository. Internet connectivity is required for those images (and the optional Google font).

## Deploy safely on a review branch

1. On GitHub's repository page, switch from `main` and enter `design/personal-portfolio-refresh` into the branch selector, then select **Create branch ... from 'main'**.
2. With the review branch selected, upload all files from this folder using **Add file → Upload files**. For existing files, GitHub's web UI may refuse a direct upload; use a local Git checkout and push, or delete/replace files through the editor. A `git` workflow is more reliable (see commands below).
3. Inspect **Files changed** / open a PR to compare. The live Pages site remains on `main` until you merge.

Recommended terminal workflow:

```bash
git clone https://github.com/IoannouKon/IoannouKon.github.io.git
cd IoannouKon.github.io
git checkout -b design/personal-portfolio-refresh
# Copy every file from this preview folder into the repository root
# (including .github if present)
git add -A
git commit -m "Redesign personal portfolio with editorial hardware aesthetic"
git push -u origin design/personal-portfolio-refresh
```

Then create a draft pull request to review without merging.

**Scope:** no production main branch changes performed; ongoing FPGA/FP16/Qwen items are labeled planned and thesis comparison figures are explicitly historic.

## v0.7 design change

LUMIXED is no longer a standalone top navigation item. The main navigation now links to **My Projects**, an expandable page that will accommodate additional hardware designs. The technical `lumixed.html` page remains accessible as the first detailed project. The live `main` branch is not modified by this package.

## v0.8 design update 

The homepage now uses a compact, vertically scrolling list of selected work rather than an uneven masonry grid. LUMIXED comes first, followed by open-source contributions and space software engineering. Future entries can be added as new `.work-row` items. The standalone My Projects page contains only real personal hardware projects (currently LUMIXED); it does **not** display fictitious future projects or large empty placeholders.

This is a review package; it does not modify the live GitHub Pages `main` branch.
