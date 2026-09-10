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

The protected Site project is configured in `.openai/hosting.json`. The protected Worker version is saved and deployed at:

`https://family-branches-george.gap2000.chatgpt.site`

The Site is currently invitation-only at the hosting layer, so a visitor without the workspace account cannot reach the app login page. The user explicitly approved making the Site publicly reachable while keeping the family tree behind the shared password, but the access change was rejected because the hosting account reached its usage limit. Retry the public access change after the limit resets; do not make the repository or family data public as a workaround.

The shared password is stored only in `.local/Family access.txt`. Do not commit it, expose it in source, or include it in chat unless the user explicitly asks for it.
