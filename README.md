# Easy-Fa

Easy-Fa is a Chrome Manifest V3 extension focused on Persian typography, mixed RTL/LTR rendering, per-site font controls, dynamic chat/content detection, and safe font application across supported websites.

**Created by JustAWall**

## Current version

- Extension version: **0.5.3**
- Easy-Fa config version: **12.0**
- Manifest: **V3**
- Package label: **Alpha 0.5.3 Redesigned Settings + Global Profiles**

## What is new in 0.5.3

### Redesigned Sites workspace

The built-in Sites section now uses a dedicated two-column workspace:

- Supported sites are shown as a **vertical rail on the left**.
- The selected site's settings open in a separate panel on the right.
- Every site shows its current enabled/disabled status directly in the rail.
- Long labels, URLs, selectors, controls, cards, and responsive layouts are constrained so they do not overflow the settings container.
- On narrow windows the layout collapses safely instead of forcing horizontal overflow.
- Site state in the rail updates immediately when a site is enabled or disabled.

### Conditional “Restore font application” context-menu item

The Smart Font Builder context menu now behaves contextually:

- **Apply font to this site** is available when no Smart Site rule exists for the current host.
- **Apply font to this page** is available when no Smart Page rule exists for the exact current URL.
- **Restore font application** is hidden by default and becomes visible only when a Smart Site or Smart Page rule is actually active for the current URL.
- Browsers that do not support dynamic context-menu visibility keep the restore item hidden instead of showing a misleading action.

## Major features added in 0.5.x

### Google Search support

Easy-Fa includes a dedicated **Google Search** profile for `google.com` and `www.google.com`.

The profile is designed to style visible search-result content while avoiding navigation and form controls. It covers common result surfaces such as:

- Search result titles
- Result snippets and descriptions
- Supporting result text
- Selected knowledge/result panel text

Google Search defaults to applying the selected font to both Persian and Latin text (`fontScope: all`) so result typography remains visually consistent when mixed-language results are displayed.

### GitHub support

Easy-Fa includes a dedicated **GitHub** profile for `github.com` and `www.github.com`.

It targets user-facing prose while protecting code-oriented surfaces. Supported content includes:

- README and Markdown content
- Issue bodies
- Issue comments and discussion text
- Issue titles
- Repository descriptions
- GitHub text editors/comment composers when composer styling is enabled

Code-related content is intentionally protected. Easy-Fa excludes common code surfaces such as `pre`, `code`, `kbd`, `samp`, diff/blob lines, and React code-line containers so monospace/code formatting is preserved.

### Smart Font Builder

The settings UI has a dedicated **Smart Font Builder** section. It can be enabled or disabled independently.

When enabled, Easy-Fa adds an **Easy-fa** entry to the browser right-click menu with rule-based actions:

- **اعمال فونت به این سایت** — apply the Smart default profile to the current domain.
- **اعمال فونت به این صفحه** — apply the Smart default profile only to the exact current page URL.
- **بازگردانی اعمال فونت** — remove the active Smart rule for the current URL; this item is only shown when a matching rule exists.

Smart Site and Smart Page rules are stored separately. A page-specific rule therefore does not automatically affect every other page on the same domain.

For non-built-in domains, Easy-Fa requests only the host permission required for that domain. Dynamic content scripts are registered only for approved custom/Smart hosts.

### Smart defaults and active rules

Smart rules inherit a dedicated default profile. From the Smart Font Builder you can:

- Choose the default font
- Set direction behavior
- Choose Persian-only or Persian + English font scope
- Set font size scope
- Set font size
- Set font weight
- Set line height
- Enable or disable composer/input styling
- Copy the current **Global Settings** profile into Smart defaults
- Apply Smart defaults to already-active Smart Site and Smart Page rules
- View active Smart rules
- Remove active Smart rules

### Global Settings

Easy-Fa 0.5.x adds a real **Global Preset** instead of only per-site controls.

Global Settings can be edited once and selectively applied to:

- Built-in supported sites
- Custom Sites
- Smart Site / Smart Page rules

The global preset includes the shared typography properties used across profiles. Applying it preserves site-specific behavior such as YouTube target toggles, ChatGPT sidebar settings, and Custom Site selector/detection settings.

### Dedicated Custom Sites section

Custom Sites are now managed in their own section instead of being mixed into the built-in Sites list.

A Custom Site can define:

- Domain / host
- Display name
- Smart or broad content detection
- Exact message/content CSS selector
- Exact composer/input CSS selector
- Typography profile
- Optional composer styling

New Custom Sites inherit the current Global Preset. Host permissions remain scoped to domains the user explicitly approves.

### Settings UI redesign

The options page is separated into four clear workspaces:

1. **Sites** — built-in service-specific controls
2. **Global Settings** — shared preset and bulk application
3. **Smart Font Builder** — right-click rules, defaults, and active rules
4. **Custom Sites** — manually managed domains and selectors

The interface includes responsive cards, status indicators, counters, Dark/Light themes, improved spacing, long-text handling, and overflow-safe layouts.

### Service Worker reliability

The Manifest V3 background worker now feature-detects optional Chromium extension APIs before registering event listeners. This prevents the whole Service Worker from failing to register on Chromium-based browsers that expose only part of the expected API surface.

Context-menu actions use the event's `pageUrl` when available, which improves reliability when applying Smart rules before an optional host permission has already been granted.

## Supported built-in sites

- **Kick**
- **YouTube**
- **YouTube Live**
- **Twitch**
- **WhatsApp Web**
- **Telegram Web**
- **Discord Web**
- **ChatGPT**
- **Gemini**
- **Claude Chat**
- **Claude Code**
- **Gmail**
- **Google Search**
- **GitHub**

In addition, Easy-Fa supports user-defined **Custom Sites** and Smart right-click rules for approved HTTP/HTTPS domains.

## Core typography controls

Each profile can use independent typography settings, including:

- Enable / disable profile
- Direction: Smart, RTL, LTR, or site/default behavior where supported
- Font selection
- Font scope: Persian-only or Persian + English
- Font-size scope
- Font size
- Font weight
- Line height
- Apply to typing/composer

Smart Persian direction uses structure-safe bidi handling so mixed Persian/English content can preserve the host page's semantic structure.

## Fonts

Easy-Fa supports multiple font sources:

### Bundled fonts

The package includes several Persian/Arabic-compatible families, including:

- Noto Sans Arabic
- Noto Naskh Arabic
- Noto Kufi Arabic
- Noto Sans Arabic UI
- Noto Naskh Arabic UI
- Noto Nastaliq Urdu
- Amiri
- DejaVu Sans
- FreeSans / FreeSerif / FreeMono
- Inter

### Configured web fonts

Easy-Fa can load configured webfont families such as:

- Vazirmatn
- Shabnam
- Sahel
- Samim
- Parastoo
- Tanha
- Gandom

### Installed system fonts

Chrome's `fontSettings` permission is used for installed-font discovery where supported.

## YouTube controls

The YouTube profile can independently control typography for:

- Watch-page video title
- Video description
- Comments and replies
- Home/Search/recommendation/compact video titles
- Player subtitles/captions

YouTube Shorts title surfaces and dynamic subtitle segments are also handled. YouTube Live uses dedicated chat-message targeting so usernames, badges, timestamps, links, and controls are not treated as message text.

## Chat and AI sites

### ChatGPT

- Conversation/message text
- Rich Markdown-safe handling
- Optional prompt/composer styling
- Independent conversation-history/sidebar option

### Gemini

- User-query text
- Model response/Markdown content
- Current rich editor/composer variants

### Claude / Claude Code

- Rich conversation text
- Composer handling
- Structure-safe Markdown processing

### Discord / Telegram / WhatsApp / Kick / Twitch / YouTube Live

Easy-Fa uses site-specific message roots and incremental DOM handling rather than repeatedly scanning the full document. Message content is targeted while common metadata/controls are protected where possible.

## Dynamic-page and performance behavior

Easy-Fa is designed for modern SPA/chat interfaces:

- Mutation observers are scoped to active content/chat roots where possible.
- Newly inserted subtrees are processed incrementally.
- Managed nodes are tracked without retaining removed DOM nodes unnecessarily.
- Composer focus/input is handled directly instead of triggering a full-page scan on every keystroke.
- Dynamic chat/content roots can be rediscovered after SPA remounts.
- Managed font state can be repaired when a host page overwrites Easy-Fa styling.
- YouTube SPA navigation and dynamic caption replacement are handled explicitly.
- Smart Page rules are re-evaluated against the current URL so a page-specific rule does not leak into a different SPA route.

## Smart RTL and rich content safety

Easy-Fa avoids flattening rich content. For supported rich-message surfaces it preserves structures such as:

- Paragraphs
- Headings
- Lists and list items
- Blockquotes
- Markdown containers
- Bold/strong emphasis
- Host spacing and hierarchy

Code blocks on GitHub and other protected code surfaces are not converted to Persian UI fonts.

## Install locally in Chrome / Chromium

1. Download or clone the repository.
2. If using a ZIP, extract it.
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the project folder containing `manifest.json`.
7. If an older Easy-Fa version is already loaded, click **Reload** on its extension card.
8. Reload already-open supported tabs once.
9. Click the Easy-Fa toolbar icon to open the settings page.

## Using Smart Font Builder

1. Open Easy-Fa settings.
2. Go to **Smart Font Builder**.
3. Enable Smart/context-menu integration.
4. Configure the default Smart typography settings.
5. Open any HTTP/HTTPS page.
6. Right-click and open **Easy-fa**.
7. Choose **Apply font to this site** or **Apply font to this page**.
8. When a matching Smart rule is active, **Restore font application** becomes available for that URL.

## Using Custom Sites

1. Open Easy-Fa settings.
2. Go to **Custom Sites**.
3. Add a domain such as `example.com`.
4. Approve the requested host permission.
5. Open that site's settings.
6. Choose Smart or Broad detection.
7. If needed, provide an exact CSS selector for message/content text.
8. If needed, provide an exact CSS selector for the composer/input.
9. Enable **Apply to typing/composer** when the editor should use Easy-Fa too.

## Permissions

Easy-Fa uses:

- `storage` — store settings, profiles, Custom Sites, and Smart rules
- `scripting` — register/inject content scripts for approved Custom/Smart hosts
- `fontSettings` — discover installed system fonts where supported
- `contextMenus` — Smart Font Builder right-click actions

Built-in supported domains are declared in `host_permissions`. Other HTTP/HTTPS hosts are requested through `optional_host_permissions` only when the user applies Easy-Fa to them.

## Validate before committing

Run from the project root:

```bash
node --check background.js
node --check shared/config.js
node --check shared/storage.js
node --check shared/font-loader.js
node --check content/detector.js
node --check content/content.js
node --check editor/editor.js
python3 -m json.tool manifest.json > /dev/null
```

## Project structure

```text
Easy-Fa/
├── manifest.json
├── background.js
├── README.md
├── CHANGELOG.md
├── assets/
│   ├── fonts/
│   └── icons/
├── content/
│   ├── content.js
│   ├── detector.js
│   └── styles.css
├── editor/
│   ├── index.html
│   ├── editor.css
│   └── editor.js
└── shared/
    ├── config.js
    ├── font-loader.js
    └── storage.js
```

## 0.4.x compatibility notes

The 0.5.x work keeps the important behavior introduced during the 0.4.x line, including:

- Restored Kick/Twitch/YouTube Live chat detection paths
- Instant/delayed dynamic apply timing
- Telegram/WhatsApp/Discord live-message handling
- YouTube Shorts and dynamic caption support
- Gemini selector updates
- ChatGPT sidebar support
- Dark/Light settings themes
- Structure-safe rich Markdown handling
- Reduced full-document rescans and incremental mutation processing

For release-by-release details, see [`CHANGELOG.md`](CHANGELOG.md).
