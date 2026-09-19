# Changelog

## 0.4.6

### Fixed
- Rebuilt Kick, Twitch and YouTube Live chat-message detection around the original 0.3.1 proven chat roots/selectors while retaining the newer incremental performance architecture.
- Added current Kick keyed-row fallback for `data-index`, `data-message-id` and `data-chat-entry` message rows inside the chat list.
- Twitch now targets the current `chat-line-message-body` surface and its `.text-fragment` leaves, in addition to the original selectors.
- YouTube Live now applies the selected font to safe nested text leaves inside `#message`, including newly inserted live messages.
- Legacy live-chat sites preserve username, badge, link, button and timestamp exclusions while ensuring nested host font rules can no longer hide Easy-Fa on message text.
- Chat-root remounts are recovered immediately by a narrow parent observer instead of waiting for a periodic full scan.

### Added
- New global **Apply timing** control: **Instant** or **Delayed**.
- **Instant** is the default and processes newly-added message nodes in the same microtask cycle across all supported sites.
- **Delayed** batches dynamic updates for about 180 ms for users who prefer lower-frequency updates on very busy pages.

### Performance
- Instant mode does not restore document-wide observers or per-keystroke rescans. Dynamic work remains scoped to the detected message/chat root.
- Selected font loading is prewarmed in parallel so direction/management can begin before the font promise resolves.
- Content scripts start at `document_start`, with a DOMContentLoaded rescan for early-load safety.

## 0.4.5

### Fixed
- Restored the original proven detection paths for Telegram Web, Kick, Twitch, WhatsApp, Discord, YouTube Live and Gmail while keeping the newer performance architecture.
- Re-enabled supported chat surfaces inside same-site/about:blank frames; the newer top-frame-only guard had disabled legacy chat surfaces in popout/embed layouts.
- Restored `match_about_blank` so chat UIs hosted in inherited-origin frames can receive Easy-Fa.
- Fixed incremental detection dropping a newly-added node when the node itself matched the message/caption selector. This affected dynamic chat messages, YouTube captions and virtualized UI.
- Telegram nested spans are re-synchronized when messages are edited or Telegram inserts new text nodes.
- Added automatic recovery when a chat/content root is destroyed and remounted by an SPA.
- Fixed Gemini user-query targeting so the actual `.query-text` leaf is styled while model Markdown remains a rich container.
- Added YouTube Shorts active-overlay title/description detection and current Shorts card-title selectors.
- YouTube subtitle segments created after the initial caption now receive Easy-Fa immediately.

### Performance
- Legacy chat sites keep the original proven selectors, while newly-added message subtrees are processed incrementally inside the detected chat root.
- AI sites keep the incremental/streaming-safe path.
- Root recovery and font repair are scoped to managed roots instead of reintroducing a document-wide observer.

## 0.4.4

### Fixed
- YouTube virtualized titles no longer jump to a larger font size while scrolling.
- YouTube captions keep Easy-Fa styling as caption segments change.
- Managed fonts recover automatically when host sites overwrite inline styles.
- Gemini message and composer detection updated for current custom-element/Quill markup.
- YouTube nested text layers are no longer styled redundantly.

### Added
- Optional ChatGPT conversation-history / Sidebar styling.
- Light theme for the Easy-Fa settings UI.

### Performance
- Font recovery checks only nodes already managed by Easy-Fa.
- ChatGPT Sidebar uses a separate narrow observer instead of widening the main conversation observer.
