# Family Tree handoff

This is an English family-tree web app for Jacqueline's family. The main interface is a minimalist, colour-coded tree with all current relatives visible, zoom/pan controls, search, expandable branches, tappable profiles, and circular photo placeholders.

## Open locally

From this folder, serve `web/`:

```bash
python3 -m http.server 8765 --directory web
```

Open `http://localhost:8765/` in a browser. The local preview is not password-protected; production authentication is implemented in `server/auth.mjs`.

## Important files

- `web/people.js` — family data and relationships.
- `web/app.js` — tree layout, colours, pan/zoom, search, profiles, and branch expansion.
- `web/style.css` — minimalist visual design.
- `web/index.html` — app shell.
- `server/auth.mjs` — password login, signed HttpOnly sessions, rate limiting, security headers, and protected asset serving.
- `server/auth.test.mjs` — authentication/security tests.
- `scripts/build.mjs` — packages the web assets into a protected Worker build.
- `.local/` — local secrets; ignored by Git. Never commit or print these files.

## Current family data

Jacqueline's parents are John Perrin and Emily Wardle. Her siblings are John, Tony, Michael, Pat, Sheila, and Barbara. John Perrin's siblings are Frank, Geoff, and Winnie. Emily Wardle's siblings are Jack, Alice, Lucy, Polly, Ruth, and Albert. Added partners and children are recorded in `web/people.js`; Claire, Rebecca, and John Dennis are confirmed spellings/relationships.

## Tests and build

Use the bundled Node runtime if `node` is unavailable:

```bash
/Users/georgephilippou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/auth.test.mjs
/Users/georgephilippou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build.mjs
```

## Hosting status

**Live site (current):** `https://georgephilippou.github.io/family-tree/`, served by GitHub Pages (public repo `GeorgePhilippou/family-tree`, deployed via `.github/workflows/pages.yml` from the `web/` folder on every push to `main`). No password gate — the user decided the data (names/relationships only, no contact info or photos) doesn't need one, and the link is only shared within the family. `robots.txt` and a `noindex` meta tag ask crawlers not to index it, but the repo itself is public (visible via GitHub search / the account's public repo list) since free GitHub accounts require a public repo for Pages.

**Password-protected path (dormant, not deleted):** `server/auth.mjs`, `server/auth.test.mjs`, and `scripts/build.mjs` still implement the original signed-session/password design and can be redeployed later (e.g. to Cloudflare Workers — the handler is already a standard `fetch(request, env)` module, so no code changes needed) if the user wants the gate back. The old ChatGPT-hosting-based deployment (`family-branches-george.gap2000.chatgpt.site`, `.openai/hosting.json`) is superseded by the above and was abandoned because it required ongoing hosting credits and was stuck invitation-only.

The shared password is stored only in `.local/Family access.txt`. Do not commit it, expose it in source, or include it in chat unless the user explicitly asks for it.

**Note for GitHub Pages:** `web/index.html` and `web/manifest.webmanifest` use paths relative to `web/` (no leading `/`), not root-relative, because the site is served from the `/family-tree/` subpath, not the domain root — a root-relative path 404s here. Relative paths also work fine if the Worker build is redeployed at a domain root, so this doesn't need to change back.

## Version label

`web/index.html` has a small `<p class="version">Version X.Y</p>` in the bottom-left corner (styled in `web/style.css`), by the user's request so they can tell whether a device (especially one relying on the offline service-worker cache) is showing a stale copy. It's a plain hardcoded string, not auto-generated. **Bump it by 0.1 on every future change to this app**, as part of the same commit.
