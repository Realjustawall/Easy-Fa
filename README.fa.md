<div align="center">

![Easy-Fa](docs/assets/banner-fa.svg)

**کنترل تایپوگرافی فارسی برای هر سایت، نمایش متن ترکیبی راست‌به‌چپ و چپ‌به‌راست، پیش‌نمایش زنده و پروفایل‌های فونت قابل استفادهٔ مجدد.**

<img alt="Version" src="https://img.shields.io/badge/version-v0.6.0-64e739?style=flat-square" />
<img alt="Platform" src="https://img.shields.io/badge/platform-Chromium%20browsers-354158?style=flat-square" />
<a href="https://github.com/Realjustawall/Easy-Fa/actions/workflows/extension-ci.yml"><img alt="CI status" src="https://img.shields.io/github/actions/workflow/status/Realjustawall/Easy-Fa/extension-ci.yml?branch=main&amp;label=CI&amp;style=flat-square" /></a>

<a href="https://github.com/Realjustawall/Easy-Fa/releases/latest"><img src="https://img.shields.io/badge/%D8%AF%D8%B1%DB%8C%D8%A7%D9%81%D8%AA-64e739?style=flat-square&labelColor=161b22" alt="دریافت" /></a>
<a href="docs/gallery.fa.md"><img src="https://img.shields.io/badge/%DA%AF%D8%A7%D9%84%D8%B1%DB%8C%20%D8%AF%D9%85%D9%88-5968c3?style=flat-square&labelColor=161b22" alt="گالری دمو" /></a>
<a href="#quick-start"><img src="https://img.shields.io/badge/%D8%B1%D8%A7%D9%87%E2%80%8C%D8%A7%D9%86%D8%AF%D8%A7%D8%B2%DB%8C-354158?style=flat-square&labelColor=161b22" alt="راه‌اندازی" /></a>
<a href="https://github.com/Realjustawall/Easy-Fa/issues"><img src="https://img.shields.io/badge/%DA%AF%D8%B2%D8%A7%D8%B1%D8%B4%20%D9%85%D8%B4%DA%A9%D9%84-354158?style=flat-square&labelColor=161b22" alt="گزارش مشکل" /></a>

[English](README.md) · [فارسی](README.fa.md)

</div>

---

[قابلیت‌های شاخص](#features) · [پیش‌نمایش](#preview) · [راه‌اندازی](#quick-start) · [توسعه](#development) · [مستندات](#documentation) · [امنیت و حریم خصوصی](#security) · [مجوز و بازخورد](#license)

<a id="features"></a>

## قابلیت‌های شاخص

| قابلیت | کاربرد |
|---|---|
| پروفایل هر سایت | کنترل مستقل فونت، وزن، اندازه، فاصلهٔ خطوط و جهت متن. |
| متن ترکیبی | محدودهٔ فقط فارسی یا فارسی و انگلیسی، مدیریت راست‌به‌چپ و چپ‌به‌راست و پیش‌نمایش زنده. |
| تنظیمات کلی | اعمال تایپوگرافی مشترک روی سایت‌های پشتیبانی‌شده و پروفایل‌های اختصاصی. |
| فونت‌سازی هوشمند | قانون برای دامنه یا صفحه، عملیات منوی راست‌کلیک و پیش‌فرض‌های قابل استفادهٔ مجدد. |
| صفحهٔ پویا | پایش تغییرات DOM و رفتار اختصاصی برای سایت‌های چت، جستجو و ویدیو. |
| محیط شخصی | سایت‌های آماده، تنظیمات کلی، سایت‌های اختصاصی و تم روشن و تیره. |

<a id="preview"></a>

## پیش‌نمایش

رابط اصلی تنظیمات با آداپتور آزمایشی Chrome API و حافظهٔ موقت ثبت شده است؛ این تصاویر اجرای اعمال فونت روی وب‌سایت‌ها را نشان نمی‌دهند.

![Easy-Fa — پروفایل وب‌سایت‌ها](docs/assets/screenshots/fa/01-sites-ui-harness.webp)

<details>
<summary>تصاویر بیشتر</summary>

![Easy-Fa — تنظیمات عمومی](docs/assets/screenshots/fa/02-global-ui-harness.webp)

![Easy-Fa — ساخت هوشمند فونت](docs/assets/screenshots/fa/03-smart-ui-harness.webp)

</details>

[مشاهدهٔ گالری کامل](docs/gallery.fa.md)

<a id="quick-start"></a>

## راه‌اندازی

۱. فایل **Easy-Fa-0.6.0.zip** را از ریلیز دریافت و استخراج کنید.
۲. در `chrome://extensions` حالت **Developer mode** را روشن کنید و **Load unpacked** را بزنید.
۳. پوشهٔ افزونه را انتخاب کنید و صفحهٔ تنظیمات آن را باز کنید.
۴. سایت موردنظر، فونت و جهت متن را تنظیم کنید و نتیجه را در پیش‌نمایش زنده ببینید.
۵. پس از نصب یا به‌روزرسانی، تب‌های پشتیبانی‌شدهٔ باز را تازه‌سازی کنید.

برای پیش‌تنظیم مشترک از **تنظیمات کلی**، برای قانون دامنه یا صفحه از **فونت‌سازی هوشمند** و برای میزبان‌های تأییدشدهٔ بیشتر از **سایت‌های اختصاصی** استفاده کنید.

<a id="development"></a>

## توسعه

نیازی به bundler نیست. پوشهٔ سورس را به‌صورت افزونهٔ unpacked بارگذاری کنید.

```bash
git clone https://github.com/Realjustawall/Easy-Fa.git
cd Easy-Fa
```

دستورهای بررسی:

```bash
node --check background.js
node --check editor/editor.js
node --check shared/storage.js
node --check content/content.js
node --check content/chatgpt-font-direct.js
```

<a id="documentation"></a>

## مستندات

- [تغییرات نسخه‌ها](CHANGELOG.md)
- [مجوزهای افزونه](manifest.json)
- [سیاست حریم خصوصی](Policy-WebC)
- [پروفایل‌های تایپوگرافی](shared/config.js)
- [نسخهٔ حفظ‌شدهٔ مستندات پیشین](REFERENCE.md)

<a id="security"></a>

## امنیت و حریم خصوصی

[مجوزهای manifest](manifest.json) را بررسی کنید. دامنه‌های اختصاصی و هوشمند از مجوز اختیاری استفاده می‌کنند و ارائه‌دهندهٔ فونت ممکن است به شبکه نیاز داشته باشد. افزونه برای تایپوگرافی طراحی شده و بخش‌های کد را محافظت می‌کند، اما تغییر DOM سایت می‌تواند انتخاب‌گرها را تحت تأثیر قرار دهد. پس از تغییر پروفایل، ورودی متن، کد و ناوبری را بررسی کنید.

<a id="license"></a>

## مجوز و بازخورد

فایل مجوز در ریشهٔ مخزن ارائه نشده است. پیش از بازتوزیع یا استفادهٔ مجدد با نگهدارنده هماهنگ کنید.

[گزارش اشکال و پیشنهاد بهبود](https://github.com/Realjustawall/Easy-Fa/issues). نسخه، سیستم‌عامل و روش بازتولید را بنویسید و اطلاعات خصوصی یا رمزها را در گزارش قرار ندهید.

---

نگهداری توسط **[Realjustawall](https://github.com/Realjustawall)**.
