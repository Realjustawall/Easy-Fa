'use strict';

// Keep the worker registrable even on Chromium-based browsers that expose only
// a subset of extension APIs. Missing optional events are feature-detected.
try {
  importScripts('shared/config.js', 'shared/storage.js');
} catch (error) {
  console.error('Easy-Fa: failed to load background dependencies', error);
}

const E = globalThis.EasyFa || {};
const SCRIPT_ID = 'easy-fa-custom-sites-v11';
const builtin = new Set([
  'kick.com', 'youtube.com', 'twitch.tv', 'web.whatsapp.com',
  'web.telegram.org', 'discord.com', 'chatgpt.com', 'chat.openai.com',
  'gemini.google.com', 'claude.ai', 'mail.google.com', 'google.com',
  'github.com'
]);
const MENU = {
  root: 'easyfa-root',
  site: 'easyfa-apply-site',
  page: 'easyfa-apply-page',
  undo: 'easyfa-undo'
};

const api = globalThis.chrome || {};
const canDynamicMenu = !!api.contextMenus?.onShown?.addListener;
const clean = value => E.Storage?.cleanHost ? E.Storage.cleanHost(value) : String(value || '').trim().toLowerCase().replace(/^www\./, '');
const patterns = host => [`*://${host}/*`, `*://*.${host}/*`];
const httpUrl = value => {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) ? url : null;
  } catch {
    return null;
  }
};
const hostOf = value => {
  const url = httpUrl(value);
  return url ? clean(url.hostname) : '';
};
const eventUrl = (info, tab) => String(info?.pageUrl || tab?.url || '').trim();

function addListener(target, eventName, listener) {
  try {
    const event = target?.[eventName];
    if (event && typeof event.addListener === 'function') {
      event.addListener(listener);
      return true;
    }
  } catch (error) {
    console.warn(`Easy-Fa: could not register ${eventName}`, error);
  }
  return false;
}

async function wantedMatches() {
  if (!E.Storage?.load) return [];
  const state = await E.Storage.load();
  const out = [];
  const hosts = new Set([
    ...(state.customSites || []).map(item => item.host),
    ...(state.smart?.sites || []).map(item => item.host),
    ...(state.smart?.pages || []).map(item => item.host)
  ].map(clean).filter(Boolean));

  for (const host of hosts) {
    if (builtin.has(host)) continue;
    for (const origin of patterns(host)) {
      try {
        if (api.permissions?.contains && await api.permissions.contains({ origins: [origin] })) {
          out.push(origin);
        }
      } catch {}
    }
  }
  return [...new Set(out)].sort();
}

function same(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

async function syncCustom() {
  try {
    if (!E.Storage?.load || !api.scripting?.getRegisteredContentScripts) return;
    const old = await api.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    const matches = await wantedMatches();
    const current = (old[0]?.matches || []).slice().sort();
    if (old.length && same(current, matches)) return;
    if (old.length && api.scripting.unregisterContentScripts) {
      await api.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
    }
    if (!matches.length || !api.scripting.registerContentScripts) return;
    await api.scripting.registerContentScripts([{
      id: SCRIPT_ID,
      matches,
      allFrames: false,
      matchOriginAsFallback: false,
      runAt: 'document_idle',
      css: ['content/styles.css'],
      js: [
        'shared/config.js',
        'shared/storage.js',
        'shared/font-loader.js',
        'content/detector.js',
        'content/content.js'
      ],
      persistAcrossSessions: true
    }]);
  } catch (error) {
    console.warn('Easy-Fa custom-site sync failed', error);
  }
}

async function syncMenus() {
  try {
    if (!E.Storage?.load || !api.contextMenus?.create) return;
    const state = await E.Storage.load();
    if (api.contextMenus.removeAll) await api.contextMenus.removeAll();
    if (!state.smart?.enabled) return;

    api.contextMenus.create({
      id: MENU.root,
      title: 'Easy-fa',
      contexts: ['page'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    api.contextMenus.create({
      id: MENU.site,
      parentId: MENU.root,
      title: 'اعمال فونت به این سایت',
      contexts: ['page'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    api.contextMenus.create({
      id: MENU.page,
      parentId: MENU.root,
      title: 'اعمال فونت به این صفحه',
      contexts: ['page'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    api.contextMenus.create({
      id: MENU.undo,
      parentId: MENU.root,
      title: 'بازگردانی اعمال فونت',
      contexts: ['page'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
      // Restore must never be shown unless a rule is active for this URL.
      // Browsers without dynamic context-menu updates simply keep it hidden.
      visible: false
    });
  } catch (error) {
    console.warn('Easy-Fa context-menu sync failed', error);
  }
}

async function refreshMenuFor(url) {
  try {
    if (!canDynamicMenu || !E.Storage?.load || !api.contextMenus?.update) return;
    const state = await E.Storage.load();
    if (!state.smart?.enabled) return;
    const page = E.Storage.matchSmartPage?.(state, url);
    const site = E.Storage.matchSmartSite?.(state, url);
    const active = !!(page || site);

    await api.contextMenus.update(MENU.site, { visible: !site });
    await api.contextMenus.update(MENU.page, { visible: !page });
    await api.contextMenus.update(MENU.undo, { visible: active });
    if (typeof api.contextMenus.refresh === 'function') api.contextMenus.refresh();
  } catch {}
}

async function ensureOrigin(host) {
  if (!host) return false;
  if (builtin.has(host)) return true;
  const origins = patterns(host);
  try {
    if (api.permissions?.contains && await api.permissions.contains({ origins })) return true;
  } catch {}
  try {
    return !!(api.permissions?.request && await api.permissions.request({ origins }));
  } catch {
    return false;
  }
}

async function injectOrReload(tab) {
  if (!tab?.id) return;
  try {
    if (api.tabs?.sendMessage) {
      await api.tabs.sendMessage(tab.id, { type: 'easyfa:reload' });
      return;
    }
  } catch {}

  try {
    if (!api.scripting?.insertCSS || !api.scripting?.executeScript) return;
    await api.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content/styles.css']
    });
    for (const file of [
      'shared/config.js',
      'shared/storage.js',
      'shared/font-loader.js',
      'content/detector.js',
      'content/content.js'
    ]) {
      await api.scripting.executeScript({ target: { tabId: tab.id }, files: [file] });
    }
  } catch (error) {
    console.warn('Easy-Fa tab injection failed', error);
  }
}

async function releaseHostIfUnused(host) {
  if (!host || builtin.has(host) || !E.Storage?.load) return;
  try {
    const state = await E.Storage.load();
    if (E.Storage.hostInUse?.(state, host)) return;
    if (api.permissions?.remove) await api.permissions.remove({ origins: patterns(host) });
  } catch {}
}

addListener(api.runtime, 'onInstalled', () => {
  void syncCustom();
  void syncMenus();
});
addListener(api.runtime, 'onStartup', () => {
  void syncCustom();
  void syncMenus();
});
addListener(api.storage, 'onChanged', (changes, area) => {
  const key = E.Config?.KEY;
  if (key && area === 'local' && changes?.[key]) {
    void syncCustom();
    void syncMenus();
  }
});
addListener(api.permissions, 'onAdded', () => void syncCustom());
addListener(api.permissions, 'onRemoved', () => void syncCustom());
addListener(api.action, 'onClicked', () => {
  try {
    const result = api.runtime?.openOptionsPage?.();
    if (result?.catch) result.catch(() => {});
  } catch {}
});
addListener(api.contextMenus, 'onShown', (info, tab) => {
  const url = eventUrl(info, tab);
  if (url) void refreshMenuFor(url);
});
addListener(api.contextMenus, 'onClicked', async (info, tab) => {
  if (![MENU.site, MENU.page, MENU.undo].includes(info?.menuItemId)) return;

  const rawUrl = eventUrl(info, tab);
  const url = httpUrl(rawUrl);
  const host = hostOf(rawUrl);
  if (!url || !host || !E.Storage?.load) return;

  if (info.menuItemId === MENU.undo) {
    if (E.Storage.removeSmartForUrl) await E.Storage.removeSmartForUrl(rawUrl);
    await releaseHostIfUnused(host);
    await injectOrReload(tab);
    await refreshMenuFor(rawUrl);
    return;
  }

  if (!await ensureOrigin(host)) return;
  const state = await E.Storage.load();
  const name = String(tab?.title || host).trim().slice(0, 80) || host;

  if (info.menuItemId === MENU.site && E.Storage.addSmartSite) {
    await E.Storage.addSmartSite({ host, name, profile: state.smart?.defaults });
  }
  if (info.menuItemId === MENU.page && E.Storage.addSmartPage) {
    await E.Storage.addSmartPage({ url: rawUrl, name, profile: state.smart?.defaults });
  }

  await injectOrReload(tab);
  await refreshMenuFor(rawUrl);
});
