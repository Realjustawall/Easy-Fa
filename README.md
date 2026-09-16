# Easy-Fa

Easy-Fa is a Chrome Manifest V3 extension for Persian typography, safe mixed RTL/LTR rendering, per-site font controls, and optional Custom Sites.

**Created by Yek Divar JustAWall.**

## Fixed build

This package is **Easy-Fa 10.2 / Alpha 0.3 UI + YouTube**.

The fixed build addresses the main issues from the previous Alpha package:

- Telegram Web detection is more tolerant of the current `/a/` and `/k/` layouts and falls back safely when Telegram changes message classes.
- Site pages are no longer restored by replacing their entire inline `style` attribute. Easy-Fa now removes only the CSS variables and direction markers that it owns, reducing conflicts with SPA updates on Telegram, Discord, WhatsApp, YouTube, Twitch, Gmail, and other sites.
- Font downloads have a short timeout and automatically fall back to the bundled Noto Sans Arabic font instead of leaving text waiting on an unavailable CDN.
- Vazirmatn is the default selected font for every built-in site profile, and all built-in profiles start enabled.
- Selecting a font automatically keeps the current site enabled, so the first font change is immediately active.
- Easy-Fa Studio uses Vazirmatn as its first-choice UI font. If Vazirmatn cannot be fetched, the UI uses the bundled Arabic fallback instead of becoming unreadable.
- Installed operating-system fonts are listed in Easy-Fa Studio through Chrome's `fontSettings` API. They can be selected like the bundled fonts and are stored safely as local system-font selections.
- Persian-only mode can use a local system font through a Unicode-range font face where Chrome supports it.
- Custom Sites now request both the root domain and its subdomains and re-sync when permissions are added or removed.
- Hash-route and SPA navigation changes trigger a new scan without permanent polling.

## Supported sites

Built-in profiles are included for:

- Kick
- YouTube (video titles)
- YouTube Live
- Twitch
- WhatsApp Web
- Telegram Web
- Discord Web
- Gmail
- Custom Sites added by the user

Every built-in site and every Custom Site keeps its own profile settings. The default profile is enabled and starts with Vazirmatn selected.

## Main features

- Smart Persian RTL using `dir="auto"` and `unicode-bidi: plaintext`.
- Message-body styling is isolated from usernames, badges, timestamps, avatars, links, and site controls as much as possible.
- Font scope: Persian only, or Persian + English.
- Size/weight scope: Persian only, or the whole detected message body.
- Independent font size, font weight, line-height, direction mode, and composer setting per site.
- Custom Sites with per-domain optional permissions.
- Built-in WOFF2 fallback fonts.
- Vazirmatn and selected Persian web fonts with a bundled fallback when the remote font is unavailable.
- System-font discovery through Chrome, including installed Persian and Latin fonts.
- Local support for B Nazanin, B Koodak, B Yekan, and IranNastaliq when installed on the operating system.
- No `eval` and no permanent polling loop.

## Direction modes

Easy-Fa provides four direction modes:

- **Smart**: lets the browser determine paragraph direction from its content. Recommended for mixed Persian/English chat.
- **Always RTL**: forces the detected message body to RTL.
- **Always LTR**: forces the detected message body to LTR.
- **Site default**: removes Easy-Fa direction overrides and keeps the website's own direction.

Easy-Fa intentionally does **not** reverse the entire chat row. Usernames, badges, timestamps, avatars, and other metadata stay in the website's original layout.

## Fonts

The default font is **Vazirmatn**.

Easy-Fa Studio also shows fonts installed on the operating system when Chrome exposes them through `chrome.fontSettings.getFontList()`. This requires the `fontSettings` extension permission included in this build.

Bundled or configured font choices include:

- Vazirmatn
- Shabnam
- Sahel
- Samim
- Parastoo
- Tanha
- Gandom
- Noto Sans Arabic
- Noto Naskh Arabic
- Noto Kufi Arabic
- Amiri
- Noto Nastaliq Urdu
- Noto Sans Arabic UI
- Noto Naskh Arabic UI
- DejaVu Sans Persian
- FreeSans Persian
- Inter
- System UI / Tahoma
- Installed system fonts detected by Chrome
- B Nazanin, B Koodak, B Yekan, and IranNastaliq when installed locally

If a configured remote web font cannot be loaded quickly, Easy-Fa falls back to the bundled Noto Sans Arabic files. The website itself is not blocked while a font is unavailable.

## Custom Sites

1. Open Easy-Fa Studio.
2. Find **Custom Site**.
3. Enter a domain such as `example.com`.
4. Optionally enter a display name.
5. Click **Add Site**.
6. Approve Chrome's permission prompt for the domain and its subdomains.
7. Reload an already-open target tab once if it was open before permission was granted.
8. Select the new site tab in Easy-Fa Studio and configure it independently.

Custom Sites use optional host permissions. Easy-Fa does not automatically request access to every website.


## Telegram Web reliability fix (0.3.1)

Telegram Web K and Telegram Web A use different DOM structures and can set their own `font-family` directly on nested text spans. Easy-Fa 0.3.1 handles both clients explicitly:

- Web K message selector: `.bubble:not(.service):not(.is-date) .message`
- Web K composer: `.input-message-input[contenteditable]`
- Web A message selector: `.MessageList .Message:not(.ActionMessage) .text-content`
- Web A composer: `#editable-message-text`
- Explicit Telegram selectors and the Persian-text fallback are merged instead of disabling fallback after the first selector match.
- Safe nested text nodes receive the selected font with stronger CSS precedence, so Telegram's own nested `font-family` rules no longer win.
- Usernames, timestamps, reactions, links, buttons, and other message metadata remain protected.

After updating the unpacked extension, click **Reload** on `chrome://extensions` and hard-refresh every open Telegram Web tab.

## Install locally in Chrome

1. Extract the ZIP file.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder that contains `manifest.json`.
6. If an older Easy-Fa build is already loaded, click **Reload** on the extension card.
7. Reload any already-open supported website tabs once.
8. Click the Easy-Fa toolbar icon to open Easy-Fa Studio.

For Telegram Web, test both `https://web.telegram.org/a/` and `https://web.telegram.org/k/` if you use both clients.

## Project structure

```text
Easy-Fa/
├── manifest.json
├── background.js
├── README.md
├── PUSH_TO_GITHUB.md
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

## Validate before committing

From the project root:

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

## GitHub repository

Target repository:

```text
https://github.com/Realjustawall/Easy-Fa
```

Default branch:

```text
main
```

For safe commands that replace the current repository contents with this fixed build, see **`PUSH_TO_GITHUB.md`**.

## Development notes

- Keep Manifest V3 compatibility.
- Avoid selectors based only on randomly generated CSS class names.
- Never apply RTL to an entire chat row when the row also contains username, badge, avatar, or timestamp metadata.
- Prefer styling the detected message body only.
- Do not restore a website's complete inline-style string after Easy-Fa changes it. Only remove properties owned by Easy-Fa.
- Keep remote-font failure non-blocking and preserve the bundled fallback.
- After changing content scripts, reload the extension and then reload the target website tab.
- After adding a new Custom Site, reload an already-open tab once after granting permission.

## Version

- Extension manifest: **0.3.0**
- Package label: **Alpha 0.3 UI + YouTube**
- Easy-Fa config version: **10.2**

## 0.3.0 fixes

- Fixed the selected-font blue card/highlight so it updates immediately.
- Added a separate **YouTube** profile for video titles alongside **YouTube Live** chat.
- Improved typing/composer detection for Telegram Web, WhatsApp Web, and Discord Web.
- Applied the Easy-Fa UI font consistently to Studio text, buttons, inputs, selects, and controls.
- The Studio page title and header are now **EASY-FA**.
