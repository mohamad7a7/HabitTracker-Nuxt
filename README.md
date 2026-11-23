# HabitTracker

پروژه مدیریت عادت‌ها با استفاده از Nuxt 4 و Frappe 16.

این پروژه از Server-Side Rendering (SSR) استفاده می‌کند و ارتباط با سرور Frappe از طریق API داخلی Nuxt انجام می‌شود.

## تکنولوژی‌ها

- Nuxt 4
- Vue 3
- Frappe 16
- JavaScript
- Session-Based Authentication
- Server-Side Rendering

## پیش‌نیازها

- Node.js
- npm
- سرور Frappe فعال
- سایت Frappe در دسترس

## نصب پروژه

ابتدا وابستگی‌ها را نصب کنید:

```bash
npm install
```

## تنظیمات محیطی

فایل `.env.example` را کپی کنید و نام فایل جدید را `.env` قرار دهید.

مقدار آدرس Frappe را در فایل `.env` تنظیم کنید:

```env
NUXT_FRAPPE_BASE_URL=http://frappe.localhost:8000
```

این آدرس باید با Host و Port واقعی سایت Frappe مطابقت داشته باشد.

## اجرای محیط توسعه

```bash
npm run dev
```

آدرس برنامه:

```text
http://frappe.localhost:3000
```

## ساخت نسخه Production

```bash
npm run build
```

## اجرای نسخه Production

```bash
node .output/server/index.mjs
```

برای مشاهده نسخه Production در محیط محلی نیز می‌توانید اجرا کنید:

```bash
npm run preview
```

## ساختار پروژه

```text
HabitTracker-Nuxt/
│
├── app/
│   ├── components/
│   │   ├── AppHeader.vue
│   │   └── HabitForm.vue
│   │
│   ├── composables/
│   │   ├── useApi.js
│   │   ├── useAuth.js
│   │   ├── useHabit.js
│   │   └── useCheckIn.js
│   │
│   ├── layouts/
│   │   └── default.vue
│   │
│   ├── middleware/
│   │   └── auth.global.js
│   │
│   ├── pages/
│   │   ├── auth.vue
│   │   ├── index.vue
│   │   └── habits/
│   │       ├── new.vue
│   │       └── [name].vue
│   │
│   ├── app.vue
│   └── error.vue
│
├── server/
│   └── api/
│       └── frappe/
│           └── [...path].js
│
├── public/
│
├── .env
├── .env.example
├── nuxt.config.ts
└── package.json
```

## احراز هویت

احراز هویت پروژه با Session داخلی Frappe انجام می‌شود.

کوکی نشست در درخواست‌های مرورگر و SSR از طریق مسیر واسط Nuxt به Frappe منتقل می‌شود.

## ارتباط با Frappe

درخواست‌های API از مسیر داخلی زیر ارسال می‌شوند:

```text
/api/frappe/api/method/
```

این مسیر درخواست‌ها را به سرور Frappe منتقل می‌کند.

## نکات امنیتی

- فایل `.env` را در Git ثبت نکنید.
- اطلاعات ورود کاربران را در کدهای سمت مرورگر ذخیره نکنید.
- احراز هویت بر اساس Session سرور Frappe انجام می‌شود.
- تنظیمات CORS و CSRF باید متناسب با دامنه‌های محیط استقرار باشند.
