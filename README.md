# Easy-Fa

Easy-Fa is a Chrome Manifest V3 extension for Persian typography, safe mixed RTL/LTR rendering, per-site font controls, composer styling, and user-defined Custom Sites.

**Created by JustAWall**

## Version 0.4.6

### 0.4.6 live chat restoration / instant apply

- Kick, Twitch and YouTube Live message text has been rebuilt from the original 0.3.1 chat detection paths, while keeping the newer bounded incremental observer architecture.
- Kick supports both the original message-content selectors and current keyed message rows (`data-index`, `data-message-id`, `data-chat-entry`) inside the chat container.
- Twitch targets `chat-line-message-body` and nested `.text-fragment` text so host-level nested font rules cannot hide the selected font.
- YouTube Live applies typography to `#message` and safe nested text leaves for every new live-chat message.
- Usernames, badges, timestamps, links and chat action buttons remain protected from message-text targeting.
- Added a global **Apply timing** setting: **Instant** (default) or **Delayed** (~180 ms batching). The setting applies to every supported site.
- Instant mode uses a microtask for newly-added nodes rather than a visible animation-frame/debounce delay.
- Chat root replacement/remount is detected by a narrow parent observer, so SPA/popout chat remounts do not wait for the periodic repair sweep.

### 0.4.5 legacy site recovery / Shorts

- Rebuilt Telegram, Kick, Twitch, WhatsApp, Discord and YouTube Live handling from the original 0.3.1 detection behavior that was known to work.
- Fixed iframe/about:blank support that had accidentally been disabled by later performance changes.
- Fixed a core incremental-scan bug that skipped a newly inserted node when that node itself matched the message/subtitle selector.
- Telegram now re-applies nested message spans after edits/dynamic rendering.
- Chat roots are automatically rediscovered after SPA remounts without watching the whole document, while new messages are processed incrementally.
- Added YouTube Shorts active overlay/title coverage and current Shorts card-title selectors.
- Dynamic YouTube subtitle segments are applied after every caption replacement.
- Gemini user-query text now targets the actual query leaf while response Markdown remains structure-safe.

### 0.4.4 dynamic rendering / font persistence

- Fixed YouTube title text growing unexpectedly when virtualized video-card nodes are reused during scrolling. Persian-only `size-adjust` is now profile-stable instead of being tied to a recycled element's previous computed size.
- YouTube title/card nodes are re-synchronized when YouTube reuses an already-managed DOM node with new text.
- YouTube captions/subtitles are repaired across caption changes and player inline-style rewrites instead of only styling the first caption segment.
- Added a lightweight managed-node health check that restores the selected font if a site overwrites Easy-Fa's inline font variables. It only scans Easy-Fa-managed nodes, not the full page.
- Gemini selectors now cover current `user-query-content`, `model-response`, `message-content`, `.markdown-main-panel`, and Quill/rich-textarea composer variants.
- ChatGPT gained an independent **Conversation history / Sidebar** option. Sidebar observation is isolated from the main conversation observer.
- Added Dark / Light theme switching to the Easy-Fa settings UI.
- YouTube overlapping title selectors are pruned to the deepest text target to avoid double-applying typography to parent + child layers.

### 0.4.3 performance / ChatGPT stability

- MutationObserver is now attached only to the active chat/content root instead of the whole document.
- No per-keystroke rescans: managed composers inherit font + bidi state without running detection on every input event.
- Streaming AI responses update only newly-added rich blocks; the whole response/conversation is not rescanned for each token.
- Known AI sites no longer use a document-wide TreeWalker fallback. Generic fallback is bounded to semantic text blocks.
- Managed-node bookkeeping uses WeakMap so removed/old chat nodes are not kept alive by the extension.
- Built-in subframes are ignored except YouTube Live Chat; custom-site scripts are registered top-frame only.
- Direction is applied immediately and no longer waits for remote font loading.
- Selector queries are combined to reduce repeated querySelectorAll calls.


This build makes Smart RTL structure-safe for rich Markdown/chat content and fixes the two main causes of artificial spacing and lost bold emphasis. It keeps the YouTube/Claude Code coverage from 0.4.1.


### Structure-safe Smart RTL and spacing fix

- Smart mode now assigns `dir="auto"` per paragraph, heading, list and list item inside rich messages. Persian and English blocks can therefore choose their own side without rewriting the message HTML.
- Explicit rich containers such as `.markdown` and `.prose` are preserved instead of being replaced by fallback leaf nodes.
- Easy-Fa no longer forces fallback `font-size`, `font-weight`, `line-height`, whitespace, letter-spacing or word-spacing values when those controls are not supposed to apply.
- Rich AI/Markdown content preserves the host site's line-height, margins, heading hierarchy, horizontal rules, bullets and numbered lists.
- Font faces are registered with real weight metadata. Regular/Medium/Bold are no longer advertised as one fake `100-900` face, so semantic `<strong>`/`<b>` and headings remain visibly bold.
- Streaming messages and dynamically created composer paragraphs are re-synchronized only inside their existing rich container, keeping Smart RTL correct without a full-page scan.

### YouTube

The YouTube profile can now independently enable or disable:

- Video title on the watch page
- Video description
- Comments and replies
- Video titles on Home, Search, recommendations, and compact lists
- YouTube player subtitles/captions (font, size/weight scope, and direction)

YouTube comment editors are also detected. The existing **Apply to typing/composer** switch controls whether Easy-Fa styles the comment box while the user is typing.

### Discord

Discord composer detection now includes Slate, Lexical, generic `role="textbox"`, and `aria-multiline` contenteditable variants. Composer detection is also checked directly on focus/input so a late-mounted editor does not require a full-page rescan.

### Performance

The previous content script could rescan a large page after almost every DOM/text mutation. This build changes that behavior:

- MutationObserver reacts only to added DOM nodes, not every character-data update.
- Newly added subtrees are scanned incrementally.
- Already-styled elements are skipped using a WeakMap marker.
- Full scans are reserved for initial load, settings changes, visibility/navigation events, and YouTube SPA navigation.
- Composer focus/input is handled directly instead of triggering a page scan on every keystroke.
- Custom-site registered content scripts are no longer unregistered/re-registered when their host match list has not changed.
- Detached styled elements are periodically cleaned from the tracking map.

### ChatGPT, Gemini, Claude, Claude Code

Built-in profiles were added for:

- ChatGPT (`chatgpt.com`, legacy `chat.openai.com`)
- Gemini (`gemini.google.com`)
- Claude Chat (`claude.ai`)
- Claude Code web (`claude.ai/code`)

Each site has its own independent typography settings. The **Apply to typing/composer** option can be enabled for the prompt box or disabled to style only conversation text. Rich editors now apply direction/alignment to the editable root and generated paragraph blocks, including ProseMirror, Quill, Lexical, and Slate.

Selectors use stable semantic/data attributes where possible, with fallback patterns for recent UI variations.

### Custom Sites

Custom Sites are stronger in 0.4.0:

- Smart auto-detection for Persian/message-like content
- Broad content mode for pages where the smart mode is too restrictive
- Optional exact CSS selector for message/text content
- Optional exact CSS selector for the typing/composer element
- Generic support for textarea and contenteditable composers
- Optional host permissions remain scoped to domains approved by the user

If an exact selector is supplied, it takes priority over generic detection.

### Kick spacing fix

Easy-Fa no longer forces `white-space: pre-wrap` onto every detected message. That rule could expose framework-generated whitespace between inline nodes and create artificial gaps on Kick and rich editors. Easy-Fa now leaves the site's whitespace, letter-spacing and word-spacing model untouched instead of overriding those properties.

## Supported built-in sites

- Kick
- YouTube
- YouTube Live
- Twitch
- WhatsApp Web
- Telegram Web
- Discord Web
- ChatGPT
- Gemini
- Claude Chat
- Claude Code
- Gmail
- Custom Sites

## Main features

- Smart Persian RTL using `dir="auto"` and `unicode-bidi: plaintext`; explicit RTL/LTR uses isolated bidi so the chosen direction is not overridden by the first character
- Persian-only font mode or Persian + English font mode
- Independent size, weight, line-height, direction, and composer setting per site
- Message-body styling isolated from usernames, badges, timestamps, avatars, and controls where possible
- Bundled Persian/Arabic fonts plus configured web fonts
- Installed operating-system font discovery through Chrome `fontSettings`
- No `eval`
- Lightweight managed-node health polling only; no full-page polling loop

## Install locally in Chrome

1. Extract the ZIP file.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json`.
6. If an older Easy-Fa build is already loaded, click **Reload** on its extension card.
7. Reload already-open supported tabs once.
8. Click the Easy-Fa toolbar icon to open Easy-Fa Studio.

## Custom Sites

1. Open Easy-Fa Studio.
2. Add a domain such as `example.com` and approve the domain permission.
3. Select the newly-created Custom Site tab.
4. Choose Smart or Broad detection.
5. If the site has unusual markup, enter an exact CSS selector for messages and/or the composer.
6. Enable **Apply to typing/composer** if the typing area should also use Easy-Fa.

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

## Version

- Extension manifest: **0.4.6**
- Package label: **Easy-Fa 0.4.6 — Live Chat Restoration + Instant Apply**
- Easy-Fa config version: **10.91**
