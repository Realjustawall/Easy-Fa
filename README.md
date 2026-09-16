# Easy-Fa

Easy-Fa is a Chrome Manifest V3 extension for Persian typography, safe mixed RTL/LTR rendering, and per-site font controls.

**Created by Yek Divar (یک دیوار).**

## Supported sites

Built-in profiles are included for:

- Kick
- YouTube Live
- Twitch
- WhatsApp Web
- Telegram Web
- Discord Web
- Gmail
- Custom Sites added by the user

Every built-in site and every Custom Site keeps its own independent settings.

## Main features

- Smart Persian RTL using `dir="auto"` and `unicode-bidi: plaintext`.
- Message body styling is isolated from usernames, badges, timestamps, avatars, links, and site controls.
- Font scope: Persian only, or Persian + English.
- Size/weight scope: Persian only, or the whole detected message body.
- Independent font size, font weight, line-height, direction mode, and composer setting per site.
- Custom Sites with per-domain optional permissions.
- Built-in WOFF2 fonts plus selected Persian web fonts with a bundled fallback.
- Local support for fonts such as B Nazanin, B Koodak, B Yekan, and IranNastaliq when installed on the operating system.
- No `eval` and no permanent polling loop.

## Direction modes

Easy-Fa provides four direction modes:

- **Smart**: lets the browser determine the paragraph direction from its content. This is the recommended default for mixed Persian/English chat.
- **Always RTL**: forces the detected message body to RTL.
- **Always LTR**: forces the detected message body to LTR.
- **Site default**: removes Easy-Fa direction overrides and keeps the website's own direction.

Easy-Fa intentionally does **not** reverse the entire chat row. Usernames, badges and timestamps stay in the website's original layout.

## Custom Sites

1. Open Easy-Fa Studio.
2. Find **Custom Site**.
3. Enter a domain such as `example.com`.
4. Optionally enter a display name.
5. Click **Add Site**.
6. Approve Chrome's permission prompt for that domain.
7. Reload the target website once.
8. Select the new site tab in Easy-Fa Studio and configure it independently.

Custom Sites use optional host permissions. Easy-Fa does not automatically request access to every website.

## Fonts

Recommended choices for Persian text include:

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

Several fallback WOFF2 families are packaged with the extension so text remains usable if a remote font cannot be fetched.

## Install locally in Chrome

1. Extract the Easy-Fa ZIP file.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder that contains `manifest.json`.
6. Reload any already-open supported website tabs once.
7. Click the Easy-Fa toolbar icon to open Easy-Fa Studio.

## Project structure

```text
Easy-Fa/
├── manifest.json
├── background.js
├── README.md
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
```

You can also validate the manifest with Python:

```bash
python3 -m json.tool manifest.json > /dev/null
```

## Push this project to GitHub

The target repository is:

```text
https://github.com/Realjustawall/Easy-Fa
```

Its default branch is `main`.

### First push to the repository

Open a terminal inside the extracted folder that contains `manifest.json`, then run:

```bash
git init
git branch -M main
git add .
git commit -m "Initial Easy-Fa release"
git remote add origin https://github.com/Realjustawall/Easy-Fa.git
git push -u origin main
```

If Git asks for authentication when using HTTPS, authenticate with GitHub CLI or a GitHub Personal Access Token. GitHub account passwords are not accepted for Git HTTPS pushes.

Using GitHub CLI:

```bash
gh auth login
git push -u origin main
```

### If `origin` already exists

Check it first:

```bash
git remote -v
```

If it points somewhere else, replace it:

```bash
git remote set-url origin https://github.com/Realjustawall/Easy-Fa.git
git branch -M main
git push -u origin main
```

### Future updates

After making changes:

```bash
git status
git add .
git commit -m "Update Easy-Fa"
git push origin main
```

### Clone the repository on another computer

```bash
git clone https://github.com/Realjustawall/Easy-Fa.git
cd Easy-Fa
```

Then copy/update the extension files, commit, and push:

```bash
git add .
git commit -m "Update Easy-Fa"
git push origin main
```

## Notes for development

- Keep Manifest V3 compatibility.
- Avoid selectors based only on randomly generated CSS class names.
- Never apply RTL to an entire chat row when the row also contains username/badge/timestamp metadata.
- Prefer styling the message body only.
- After changing content scripts, reload the extension and then reload the target website tab.
- After adding a new Custom Site, reload that site once after granting permission.

## Version

This package is **Easy-Fa 10.1.0**.
