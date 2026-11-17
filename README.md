# Konstantinos Ioannou — Engineering Portfolio

A responsive, deployable personal portfolio featuring LUMIXED, professional background and collaboration contact links. Built with HTML, CSS and vanilla JS. **No hosting fees, framework, API keys or backend required.**

## Publish for free at https://ioannoukon.github.io

1. On GitHub, create a new **public** repository named exactly `IoannouKon.github.io` under account `IoannouKon`. Do not add a README or template (the site already includes one).
2. Upload **all the contents** of this folder into the repository root, including the hidden `.github/workflows/deploy.yml` file. For easier uploads, clone the empty repository and copy the folder contents there.
3. Go to repository **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. The workflow runs on a push to `main`. Open **Actions** to see deployment status; your live URL will be **https://ioannoukon.github.io/**.

The site is static but fully functional on the web: multi-page navigation, mobile menu, interactive system explorer, email action/copy, and links to the source repository. A backend is neither necessary nor included.

## Local development (optional)

Run `python3 -m http.server 8080` and open `http://localhost:8080` for a local preview.

## Files
- `index.html`: Home and project cards
- `lumixed.html`: LUMIXED project and interactive architecture explorer
- `about.html`: About and collaboration contact
- `style.css` and `script.js`: Shared styling and interactions
- `.github/workflows/deploy.yml`: Automated free GitHub Pages deployment

**Accuracy note:** FP16/group scaling, Qwen linear-layer validation and ZCU106 deployment are described as planned/ongoing, not verified features. The embedded legacy figure comes from the public LUMAX repository.
