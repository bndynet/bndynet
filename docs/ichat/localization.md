# Localization (i18n)

All user-facing strings flow from a single place: **`config.locale`** + **`config.labels`**. There is one unified dictionary (`ChatLabels`) covering the composer, reasoning block, tool-call card, message list, and date separators. Built-in dictionaries are provided for `en` (default) and `zh` / `zh-CN`; unknown locales fall back to English.

- **`locale`** also drives `Intl`-based formatting (timestamps and assistant duration via `Intl.NumberFormat` / `Intl.DurationFormat`).
- **`labels`** is a deep-partial override merged on top of the locale dictionary — supply only the strings you want to change.

```javascript
const chat = document.querySelector('i-chat');

// 1) Built-in Chinese (one line):
chat.config = { locale: 'zh-CN' };

// 2) Any locale + your own translations (e.g. from vue-i18n / i18next):
chat.config = {
  locale: 'fr',
  labels: {
    composer: { placeholder: 'Écrivez un message…', send: 'Envoyer' },
    reasoning: { thinking: 'Réflexion…', reasoning: 'Raisonnement' },
    toolCall: { running: 'En cours…', approve: 'Autoriser', reject: 'Refuser' },
    messages: { empty: 'Aucun message. Démarrez la conversation\u202f!' },
    dateSeparator: {
      today: "Aujourd'hui",
      yesterday: 'Hier',
      daysAgo: (n) => `il y a ${n} jours`,
      older: 'Plus ancien',
    },
  },
};
```

The library intentionally ships **no i18n runtime** — translations come from your app (vue-i18n, i18next, …); you just fill in `config.labels`. Helpers are exported for advanced use: `resolveLabels({ locale, labels })`, `CHAT_LABELS_EN`, `CHAT_LABELS_ZH_CN` (and `resolveComposerLabels`, `COMPOSER_LABELS_*` from `@bndynet/ichat-input` for standalone composer use).

`ChatLabels` sections: `composer` (placeholder, send/cancel/voice button labels + titles, listening overlay), `reasoning` (`thinking`, `reasoning`), `toolCall` (state labels, section headings, approve/reject), `messages` (`empty`, `dismissError`, `scrollToLatest`), and `dateSeparator` (`today`, `yesterday`, `daysAgo(n)`, `older`).

> The older `config.dateSeparatorLabels` still works but is deprecated — prefer `config.labels.dateSeparator`.

## Plurals (`makeDaysAgo`)

`dateSeparator.daysAgo(n)` is a function so you control grammar. For languages with several plural forms (Russian, Arabic, Polish, …) a single template is wrong. Use **`makeDaysAgo(locale, forms)`** — it picks the correct CLDR plural category via `Intl.PluralRules`. Provide a template per category (`one` / `two` / `few` / `many` / `other`); `other` is the required fallback:

```javascript
import { makeDaysAgo } from '@bndynet/ichat';

chat.config = {
  locale: 'ru',
  labels: {
    dateSeparator: {
      today: 'сегодня',
      yesterday: 'вчера',
      older: 'ранее',
      daysAgo: makeDaysAgo('ru', {
        one: (n) => `${n} день назад`,
        few: (n) => `${n} дня назад`,
        many: (n) => `${n} дней назад`,
        other: (n) => `${n} дней назад`,
      }),
    },
  },
};
```

## Right-to-left (RTL)

All component styles use **CSS logical properties** (`margin-inline-*`, `padding-inline-*`, `border-inline-*`, `inset-inline-*`, logical `border-*-radius`, `text-align: start/end`), so the layout mirrors automatically for RTL languages. Just set **`dir="rtl"`** on `<i-chat>` (or any ancestor) — `direction` inherits into the shadow DOM, flipping bubble alignment, avatars, the speech-bubble "tail", quote bars, the reasoning chevron, etc.

```html
<i-chat dir="rtl" .config=${{ locale: 'ar', labels: arabicLabels }}></i-chat>
```

The demo's **Chat** page has a language switcher (English / 简体中文 / العربية) that toggles `dir` so you can see RTL + `makeDaysAgo` live.
