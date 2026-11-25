# HabitTracker

پروژه مدیریت عادت‌ها با استفاده از **Nuxt 4** و **Frappe 16**.

این پروژه از قابلیت **Server-Side Rendering (SSR)** استفاده می‌کند. ارتباط فرانت‌اند با سرور Frappe از طریق API داخلی Nuxt و یک Server Proxy انجام می‌شود.

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
- سرور Frappe 16 فعال
- سایت Frappe در دسترس
- بک‌اند HabitTracker آماده و پیکربندی‌شده

## نصب پروژه

ابتدا وابستگی‌ها را نصب کنید:

```bash
npm install
```

## تنظیمات محیطی

فایل `.env.example` را در مسیر اصلی پروژه کپی کنید و نام نسخه کپی‌شده را `.env` قرار دهید.

مقدار آدرس Frappe را در فایل `.env` تنظیم کنید:

```env
NUXT_FRAPPE_BASE_URL=http://frappe.localhost:8000
```

این آدرس باید با آدرس واقعی سرور Frappe مطابقت داشته باشد و از سمت سرور Nuxt قابل دسترسی باشد.

فایل `.env` نباید در Git ثبت شود.

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

در محیط Production، متغیر `NUXT_FRAPPE_BASE_URL` باید در تنظیمات محیط اجرای برنامه تعریف شود.

## راه‌اندازی بک‌اند Frappe

پیش از اجرای فرانت‌اند، سایت Frappe باید آماده و دارای اجزای زیر باشد:

### DocTypeها

**Habit**

اطلاعات مربوط به عادت‌ها را نگهداری می‌کند.

فیلدهای اصلی:

- `title`
- `frequency`
- `start_date`
- `time`
- `once_date`
- `day_of_month`

مقادیر `frequency`:

- `D`: روزانه
- `O`: یک‌باره
- `M`: ماهانه

**CheckIn**

وضعیت انجام عادت در یک تاریخ مشخص را نگهداری می‌کند.

فیلدهای اصلی:

- `habit`
- `date`
- `is_done`

ترکیب `habit` و `date` باید یکتا باشد.

### API Methodهای موردنیاز

متدهای زیر باید در سایت Frappe موجود و قابل دسترسی باشند:

| API Method                       | کاربرد                          |
| -------------------------------- | ------------------------------- |
| `login`                          | ورود کاربر                      |
| `logout`                         | خروج کاربر                      |
| `frappe.auth.get_logged_user`    | بررسی نشست کاربر                |
| `habit_tracker_register`         | ثبت‌نام کاربر                   |
| `habit_tracker_get_habits`       | دریافت عادت‌ها                  |
| `habit_tracker_get_habit_detail` | دریافت اطلاعات یک عادت          |
| `habit_tracker_create_habit`     | ایجاد عادت                      |
| `habit_tracker_update_habit`     | ویرایش عادت                     |
| `habit_tracker_delete_habit`     | حذف عادت                        |
| `habit_tracker_get_checkins`     | دریافت وضعیت عادت‌ها            |
| `habit_tracker_create_checkin`   | ایجاد یا به‌روزرسانی وضعیت عادت |

متد `habit_tracker_get_checkins` از فیلتر اختیاری `date` پشتیبانی می‌کند. در صورت ارسال این فیلتر، وضعیت مربوط به همان تاریخ دریافت می‌شود.

متد `habit_tracker_create_checkin` وضعیت عادت را بر اساس ترکیب عادت و تاریخ ایجاد یا به‌روزرسانی می‌کند.

نکته: احراز هویت ثبت‌نام باید مطابق تنظیمات بک‌اند انجام شود و متد ثبت‌نام برای کاربران مهمان قابل دسترسی باشد.

اگر DocTypeها و API Methodها در یک اپلیکیشن سفارشی Frappe نگهداری می‌شوند، آن اپلیکیشن باید روی سایت موردنظر نصب و آماده شده باشد.

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
│   │   ├── useAuthState.js
│   │   ├── useCheckIn.js
│   │   ├── useHabit.js
│   │   ├── useToday.js
│   │   └── useToast.js
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
│   ├── utils/
│   │   └── apiErrors.js
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
├── .env.example
├── .gitignore
├── nuxt.config.ts
├── package.json
└── package-lock.json
```

فایل `.env` به دلیل داشتن تنظیمات محیطی محلی در ساختار فایل‌های قابل ثبت در Git قرار نمی‌گیرد.

## احراز هویت

احراز هویت پروژه با سیستم Session داخلی Frappe انجام می‌شود.

کوکی نشست `sid` برای حفظ وضعیت ورود کاربر استفاده می‌شود.

درخواست‌های فرانت‌اند از طریق Nuxt به Frappe ارسال می‌شوند. در این فرآیند، کوکی نشست برای درخواست‌های مربوطه منتقل می‌شود.

## ارتباط با Frappe

فرانت‌اند درخواست‌های API را به مسیر داخلی Nuxt ارسال می‌کند:

```text
/api/frappe/api/method/
```

این مسیر نقش واسط بین فرانت‌اند و Frappe را دارد.

مرورگر مستقیماً APIهای Frappe را فراخوانی نمی‌کند؛ بنابراین در این معماری برای ارتباط مرورگر با APIهای Frappe نیازی به تنظیم CORS نیست.

### متدهای مجاز پروکسی

پروکسی Nuxt فقط متدهای زیر را می‌پذیرد:

- `login`
- `logout`
- `frappe.auth.get_logged_user`
- `habit_tracker_register`
- `habit_tracker_get_habits`
- `habit_tracker_get_habit_detail`
- `habit_tracker_create_habit`
- `habit_tracker_update_habit`
- `habit_tracker_delete_habit`
- `habit_tracker_get_checkins`
- `habit_tracker_create_checkin`

فقط درخواست‌های HTTP از نوع `GET` و `POST` مجاز هستند.

اندازه بدنه درخواست‌های `POST` حداکثر یک مگابایت است و این درخواست‌ها باید دارای هدر معتبر `Content-Length` باشند.

هر متدی که در فهرست مجاز قرار نداشته باشد با پاسخ `404` رد می‌شود.

## نکات امنیتی

- فایل `.env` را در Git ثبت نکنید.
- اطلاعات ورود کاربران را در کدهای سمت مرورگر ذخیره نکنید.
- احراز هویت بر اساس Session سرور Frappe انجام می‌شود.
- متدهای قابل فراخوانی از طریق پروکسی باید محدود به فهرست مجاز باشند.
- برای محیط Production از HTTPS استفاده کنید.
- در زمان استقرار، ویژگی‌های امنیتی کوکی نشست Frappe مانند `HttpOnly`، `Secure` و `SameSite` را بررسی کنید.
