<div align="center">

![Easy-Fa](docs/assets/banner-en.svg)

**Per-site Persian typography, stable mixed-direction text, live previews and reusable font profiles for supported websites.**

<img alt="Version" src="https://img.shields.io/badge/version-v0.6.0-64e739?style=flat-square" />
<img alt="Platform" src="https://img.shields.io/badge/platform-Chromium%20browsers-354158?style=flat-square" />
<a href="https://github.com/Realjustawall/Easy-Fa/actions/workflows/extension-ci.yml"><img alt="CI status" src="https://img.shields.io/github/actions/workflow/status/Realjustawall/Easy-Fa/extension-ci.yml?branch=main&amp;label=CI&amp;style=flat-square" /></a>

<a href="https://github.com/Realjustawall/Easy-Fa/releases/latest"><img src="https://img.shields.io/badge/Download-64e739?style=flat-square&labelColor=161b22" alt="Download" /></a>
<a href="docs/gallery.en.md"><img src="https://img.shields.io/badge/Demo%20gallery-5968c3?style=flat-square&labelColor=161b22" alt="Demo gallery" /></a>
<a href="#quick-start"><img src="https://img.shields.io/badge/Quick%20start-354158?style=flat-square&labelColor=161b22" alt="Quick start" /></a>
<a href="https://github.com/Realjustawall/Easy-Fa/issues"><img src="https://img.shields.io/badge/Report%20an%20issue-354158?style=flat-square&labelColor=161b22" alt="Report an issue" /></a>

[English](README.md) · [فارسی](README.fa.md)

</div>

---

[Highlights](#features) · [Preview](#preview) · [Quick start](#quick-start) · [Development](#development) · [Documentation](#documentation) · [Security and privacy](#security) · [License and feedback](#license)

<a id="features"></a>

## Highlights

| Capability | What you get |
|---|---|
| Per-site profiles | Independent font, weight, size, line height and direction controls. |
| Mixed text | Persian-only or Persian + English scope with RTL/LTR handling and live previews. |
| Global presets | Apply common typography across supported sites and custom profiles. |
| Smart Font Builder | Domain/page rules, context-menu actions and reusable defaults. |
| Dynamic pages | DOM observers and dedicated handling for supported chat, search and video sites. |
| Personal workspace | Supported sites, global settings, custom sites and light/dark themes. |

<a id="preview"></a>

## Preview

The settings interface is currently Persian. Captures render the original UI with an in-memory Chrome API adapter; website font injection is not demonstrated.

[Open the full gallery](docs/gallery.en.md)

[Browse the original Persian interface screenshots](docs/gallery.fa.md).

<a id="quick-start"></a>

## Quick start

1. Download **Easy-Fa-0.6.0.zip** from Releases and extract it.
2. Open `chrome://extensions`, enable **Developer mode** and choose **Load unpacked**.
3. Select the extension directory, then open its settings page.
4. Choose a supported site, set its font and direction, and check the live preview.
5. Reload already-open supported tabs after installing or updating.

Use **Global Settings** for shared presets, **Smart Font Builder** for domain/page rules and **Custom Sites** for additional approved hosts. The settings interface is Persian.

<a id="development"></a>

## Development

No bundler is required. Load the source directory as an unpacked extension.

```bash
git clone https://github.com/Realjustawall/Easy-Fa.git
cd Easy-Fa
```

Validation commands:

```bash
node --check background.js
node --check editor/editor.js
node --check shared/storage.js
node --check content/content.js
node --check content/chatgpt-font-direct.js
```

<a id="documentation"></a>

## Documentation

- [Changelog](CHANGELOG.md)
- [Extension permissions](manifest.json)
- [Privacy policy](Policy-WebC)
- [Typography profiles](shared/config.js)
- [Preserved documentation reference](REFERENCE.md)

<a id="security"></a>

## Security and privacy

Review the declared [manifest permissions](manifest.json). Custom/Smart hosts use optional approvals; font providers may require network access. The extension targets typography and preserves protected code surfaces, but site DOM changes can affect selectors. Check text inputs, code and navigation after changing a profile.

<a id="license"></a>

## License and feedback

No repository-level license file is currently provided. Contact the maintainer before redistribution or reuse.

[Report bugs or discuss improvements](https://github.com/Realjustawall/Easy-Fa/issues). Include your version, OS and reproducible steps; keep credentials and private data out of reports.

---

Maintained by **[Realjustawall](https://github.com/Realjustawall)**.
