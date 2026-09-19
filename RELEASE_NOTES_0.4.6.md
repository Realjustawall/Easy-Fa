# Easy-Fa 0.4.6

This release restores reliable live-chat font application while keeping the low-latency incremental architecture introduced in recent builds.

## Highlights

- Restored Kick, Twitch and YouTube Live chat-message detection around the proven legacy chat roots/selectors.
- Added current Kick message-row fallbacks for `data-index`, `data-message-id` and `data-chat-entry`.
- Twitch now styles the current `chat-line-message-body` surface and `.text-fragment` text leaves.
- YouTube Live now styles nested message text inside `#message`, including newly inserted live messages.
- Preserves usernames, badges, links, buttons and timestamps while styling actual chat message text.
- Recovers immediately when live-chat roots are remounted by SPA navigation.
- Added global **Apply timing** setting:
  - **Instant** (default): applies in the same microtask cycle.
  - **Delayed**: batches dynamic updates for roughly 180 ms on very busy pages.
- Keeps observers scoped to active content/chat roots to avoid restoring document-wide lag.

See `CHANGELOG.md` for the full history.
