# React integration

`<i-chat>` is a standard Web Component, so React can render it directly — no wrapper package required. This guide covers the four things a React app actually needs: **ref binding**, **props**, **event listening**, and **TypeScript declaration merging**. It ends with a controlled-mode recipe and the React-specific pitfalls (StrictMode, SSR, prop identity).

- [Install and register](#install-and-register)
- [Copy-paste starter](#copy-paste-starter)
- [Ref binding](#ref-binding)
- [Passing props](#passing-props)
- [Listening to events](#listening-to-events)
- [Controlled mode](#controlled-mode)
- [TypeScript: declaration merging](#typescript-declaration-merging)
- [Slots and children](#slots-and-children)
- [Composer interactions](#composer-interactions)
- [Next.js and SSR](#nextjs-and-ssr)
- [Pitfalls](#pitfalls)

> **React version matters.** React 19 assigns object/array props as element _properties_ and turns `on…` props into event listeners. React 18 and earlier stringify every unknown prop into an attribute and ignore custom events entirely. The ref-based patterns below work identically on both; version-specific shortcuts are called out where they apply.

---

## Install and register

```bash
npm install @bndynet/ichat
```

Importing the package registers `<i-chat>` with `customElements`. Do this **once**, at module scope in your entry file or in the module that renders the chat — never inside a callback that runs after the element is already in the DOM:

```tsx
import "@bndynet/ichat";
```

Optional fenced-block renderers are separate side-effect imports:

```tsx
import "@bndynet/ichat-renderers"; // KPI cards, forms
import "@bndynet/ichat-renderer-chart"; // bar / line / area / pie / gauge
import "@bndynet/ichat-renderer-katex"; // $inline$ and $$display$$ math
import "@bndynet/ichat-renderer-mermaid"; // diagrams
```

Registration order matters for React 19 prop assignment: React checks `'messages' in element` to decide between a property and an attribute, and that check only passes once the custom element has been upgraded. A top-level `import` guarantees `customElements.define()` has run before React commits anything.

---

## Copy-paste starter

A complete, uncontrolled chat panel with streaming, cancellation, and error handling. This is the recommended shape for most apps.

```tsx
// ChatPanel.tsx
import { useEffect, useRef } from "react";
import "@bndynet/ichat";
import {
  textPart,
  type Chat,
  type ChatConfig,
  type ChatRunController,
} from "@bndynet/ichat";

const config: ChatConfig = { locale: "en", pendingIndicator: "dots" };

export function ChatPanel() {
  const chatRef = useRef<Chat>(null);
  const runRef = useRef<ChatRunController | null>(null);

  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;

    // React <= 18 cannot pass objects as props — assign them here.
    chat.config = config;

    const onSend = (event: Event) => {
      void handleSend(
        (event as CustomEvent<{ content: string }>).detail.content,
      );
    };
    const onCancel = () => {
      runRef.current?.cancel("*— Response stopped —*");
    };

    chat.addEventListener("send", onSend);
    chat.addEventListener("cancel", onCancel);
    return () => {
      chat.removeEventListener("send", onSend);
      chat.removeEventListener("cancel", onCancel);
      runRef.current?.cancel();
    };
  }, []);

  async function handleSend(content: string) {
    const chat = chatRef.current;
    if (!chat) return;

    chat.addMessage({
      id: crypto.randomUUID(),
      role: "self",
      parts: [textPart(content)],
      timestamp: Date.now(),
    });

    const run = chat.createRunController();
    runRef.current = run;

    // Create the placeholder before the first await so the composer locks
    // immediately and Send switches to Cancel.
    run.start([textPart("", { id: "body", status: "streaming" })]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: run.signal,
      });
      if (!response.ok || !response.body) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        run.appendText("body", value);
      }
      run.complete();
    } catch (error) {
      // A cancelled run is already terminal — do not overwrite it with an error.
      if (run.status !== "streaming") return;
      run.fail(error instanceof Error ? error.message : String(error));
    } finally {
      if (runRef.current === run) runRef.current = null;
    }
  }

  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex" }}>
      <i-chat ref={chatRef} placeholder="Message…" />
    </div>
  );
}
```

Two things to note. `<i-chat>` is `height: 100%` and `flex: 1 1 auto`, so it needs an ancestor with a resolved height — without one it collapses to zero, which is the most common "it renders nothing" report.

---

## Ref binding

Everything imperative goes through a ref to the element instance. The ref holds a real `Chat` instance, so all documented methods (`addMessage`, `updatePart`, `createRunController`, `requestConfirmation`, `requestComposerInteraction`, `scrollToMessage`, …) are available on it.

```tsx
const chatRef = useRef<Chat>(null);
// …
<i-chat ref={chatRef} />;
```

Two rules:

**Read `chatRef.current` inside effects or event handlers, never during render.** The element does not exist on the first render pass.

**Await `chat.ready` before calling DOM-dependent methods.** Data methods (`addMessage`, `updateMessage`, `appendPart`, `updatePart`, `clear`, `cancel`) are safe immediately — they are queued or applied to the message store directly. Presentation methods that reach into the shadow DOM (`scrollToMessage`, `scrollToPart`, `updateProgressStep`, `focusInput`) return `false` or no-op before the first render:

```tsx
useEffect(() => {
  const chat = chatRef.current;
  if (!chat) return;
  let cancelled = false;
  void chat.ready.then(() => {
    if (!cancelled) chat.focusInput();
  });
  return () => {
    cancelled = true;
  };
}, []);
```

If the chat is rendered conditionally or moved between parents, use a callback ref so you attach and detach at the right moments:

```tsx
const attach = useCallback((el: Chat | null) => {
  if (!el) return;
  el.config = config;
}, []);

<i-chat ref={attach} />;
```

---

## Passing props

| Property                                     | Type                             | React 19 as JSX prop       | React ≤ 18                  |
| -------------------------------------------- | -------------------------------- | -------------------------- | --------------------------- |
| `messages`                                   | `ChatMessage[]`                  | `messages={messages}`      | ref only                    |
| `config`                                     | `ChatConfig`                     | `config={config}`          | ref only                    |
| `emptyText`                                  | `string`                         | `emptyText="…"`            | `emptytext="…"`             |
| `placeholder`                                | `string`                         | `placeholder="…"`          | `placeholder="…"`           |
| `disabled`                                   | `boolean`                        | `disabled={true}`          | ref only                    |
| `messageMode`                                | `'uncontrolled' \| 'controlled'` | `messageMode="controlled"` | `message-mode="controlled"` |
| `showVoiceInput`                             | `boolean`                        | `showVoiceInput={false}`   | ref only                    |
| `voiceLang`                                  | `string`                         | `voiceLang="zh-CN"`        | `voice-lang="zh-CN"`        |
| `busy`, `ready`, `activeComposerInteraction` | readonly                         | **never pass**             | **never pass**              |

These properties are getter-only. Passing them as props makes React attempt to assign them, which throws in strict mode. Observe `busy` through `busy-change`, track the interaction queue through `composer-interaction-change`, and read `activeComposerInteraction` only as an initial snapshot through the ref.

### React ≤ 18: assign in an effect

React 18 converts every unknown prop to a string attribute, so `config={{ locale: 'en' }}` becomes `config="[object Object]"`. Keep JSX props to `ref`, `className`, `style`, `slot`, and children; set the rest imperatively:

```tsx
useEffect(() => {
  const chat = chatRef.current;
  if (!chat) return;
  chat.config = config;
  chat.placeholder = "Message…";
  chat.disabled = disabled;
}, [config, disabled]);
```

Boolean attributes are a specific trap on React ≤ 18: `show-voice-input={false}` renders `show-voice-input="false"`, and a Lit `Boolean` property reads _presence_, so the feature stays enabled. Always assign booleans through the ref.

### Keep object props referentially stable

Assigning `config` triggers a Lit update. A fresh object literal on every render means a re-render of the whole message list on every parent render:

```tsx
// Wrong — new object identity on every render
<i-chat config={{ locale, pendingIndicator: "dots" }} />;

// Right
const config = useMemo(() => ({ locale, pendingIndicator: "dots" }), [locale]);
<i-chat config={config} />;
```

Define truly static config at module scope, outside the component.

---

## Listening to events

`<i-chat>` communicates through `CustomEvent`s. All of them bubble and cross shadow boundaries, so you can listen on the element itself with `addEventListener`.

### React 19 shortcut: `on…` props

React 19 registers a listener for any prop starting with `on` whose value is a function. The event name is **the prop name minus `on`, verbatim and case-sensitive** — a trailing `Capture` selects the capture phase. That means lowercase prop names for this library:

```tsx
<i-chat
  onsend={(e) => handleSend(e.detail.content)}
  oncancel={() => runRef.current?.cancel()}
  onmessages-change={(e) => setMessages(e.detail.messages)}
/>
```

| Event                         | React 19 prop                   |
| ----------------------------- | ------------------------------- |
| `send`                        | `onsend`                        |
| `cancel`                      | `oncancel`                      |
| `messages-change`             | `onmessages-change`             |
| `streaming-change`            | `onstreaming-change`            |
| `busy-change`                 | `onbusy-change`                 |
| `message-action`              | `onmessage-action`              |
| `part-action`                 | `onpart-action`                 |
| `link-click`                  | `onlink-click`                  |
| `chat-renderer-error`         | `onchat-renderer-error`         |
| `confirmation-change`         | `onconfirmation-change`         |
| `confirmation-decision`       | `onconfirmation-decision`       |
| `composer-interaction-change` | `oncomposer-interaction-change` |
| `composer-interaction-result` | `oncomposer-interaction-result` |

`onSend` (camelCase) silently listens for an event named `Send` and never fires — there is no warning, so this is worth a lint rule if your team uses this style. `onCancel` is worse: it is a _known_ React event name, so it goes through the synthetic event system and never reaches the custom element at all. When in doubt, use `addEventListener` with exact lowercase event names.

---

## Controlled mode

By default `<i-chat>` owns its messages and `chat.messages` is up to date immediately after every mutation — just read it. Reach for controlled mode only when an external store must be the single source of truth (a sidebar, an export view, and the chat all reading one array).

```tsx
import { useRef, useState, useEffect } from "react";
import type { ChatMessage } from "@bndynet/ichat";

export function ControlledChat() {
  const chatRef = useRef<Chat>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;
    const handler = (event: Event) => {
      const e = event as CustomEvent;
      if (e.detail.reason === "message:add" && !hasCredits()) {
        event.preventDefault();
        return;
      }
      setMessages(e.detail.messages);
    };
    chat.addEventListener("messages-change", handler);
    return () => chat.removeEventListener("messages-change", handler);
  }, []);

  return <i-chat ref={chatRef} messageMode="controlled" messages={messages} />;
}
```

Four React-specific rules:

**Assign `event.detail.messages` by reference.** Do not clone, `map`, or sort it before storing. The component tracks proposals by identity; handing back a transformed array is interpreted as an intentional external history replacement, which discards concurrent streaming updates.

**Never use a functional update.** `setMessages((prev) => [...prev, msg])` derives from React's snapshot, which is behind the component's latest proposal. `event.detail.messages` already contains the full next state.

**Do not reach for `flushSync`.** Sequential imperative mutations build on the latest proposal while React propagates state asynchronously, so synchronous write-back is unnecessary and would stall streaming.

**`preventDefault()` must be synchronous.** The event has already been dispatched by the time an `await` resolves. For asynchronous checks (a moderation call, a save that may fail), accept the proposal and undo it afterwards with `run.cancel(hint)` or by assigning a corrected array.

Writing the array back through the `messages` prop does **not** re-emit `messages-change`, so there is no feedback loop.

On React ≤ 18, mirror the state onto the element yourself:

```tsx
useEffect(() => {
  if (chatRef.current) chatRef.current.messages = messages;
}, [messages]);
```

### Performance

Controlled mode calls `setState` once per streamed token, re-rendering the React subtree at token rate. If that shows up in a profile:

- Keep the chat uncontrolled and mirror into your store only on `complete` — usually enough, since most consumers need the finished transcript, not every delta.
- Or back the messages with an external store and `useSyncExternalStore`, so only subscribers re-render instead of the component tree that owns `<i-chat>`.

See [Rejected proposals](./component-api.md#rejected-proposals) for the full contract and `ChatMutationOutcome` semantics.

---

## TypeScript: declaration merging

The package already ships `HTMLElementTagNameMap['i-chat']`, so `document.querySelector('i-chat')` is typed. React needs two more things: an entry in `JSX.IntrinsicElements` so `<i-chat>` type-checks in TSX, and typed `addEventListener` overloads so `event.detail` is not `any`.

Create `src/ichat.ts` (a `.ts` module, not a `.d.ts` — it exports real types you import elsewhere):

```ts
// src/ichat.ts
import type {
  Chat,
  ChatComposerInteractionChangeDetail,
  ChatComposerInteractionResult,
  ChatConfig,
  ChatConfirmationChangeDetail,
  ChatConfirmationResult,
  ChatLinkClickDetail,
  ChatMessage,
  ChatMessageMode,
  ChatPartActionDetail,
  ExtendedChatMessage,
  MessagesChangeDetail,
  RendererErrorDetail,
} from "@bndynet/ichat";

export type { ChatMessage, ChatConfig };

/**
 * The custom `x-*` parts this app renders. Leave it empty until you register a
 * part renderer — every type below follows it automatically.
 * See "Typed custom `x-*` parts" below.
 */
export type IChatParts = {};

/** Every event `<i-chat>` dispatches, mapped to its concrete event type. */
export interface IChatEventMap {
  send: CustomEvent<{ content: string }>;
  cancel: CustomEvent<null>;
  "messages-change": CustomEvent<MessagesChangeDetail>;
  "streaming-change": CustomEvent<{ streaming: boolean }>;
  "busy-change": CustomEvent<{ busy: boolean }>;
  "message-action": CustomEvent<{ action: string; message: ChatMessage }>;
  "part-action": CustomEvent<ChatPartActionDetail>;
  "link-click": CustomEvent<ChatLinkClickDetail>;
  "chat-renderer-error": CustomEvent<RendererErrorDetail>;
  "confirmation-change": CustomEvent<ChatConfirmationChangeDetail>;
  "confirmation-decision": CustomEvent<ChatConfirmationResult>;
  "composer-interaction-change": CustomEvent<ChatComposerInteractionChangeDetail>;
  "composer-interaction-result": CustomEvent<ChatComposerInteractionResult>;
}

/**
 * The `<i-chat>` instance type with typed event listeners.
 * Interface-extends-class merging keeps every method and property of `Chat`
 * while narrowing `addEventListener` / `removeEventListener`.
 */
export interface IChatElement<
  TExtraParts extends Record<`x-${string}`, unknown> = {},
> extends Chat<TExtraParts> {
  addEventListener<K extends keyof IChatEventMap>(
    type: K,
    listener: (
      this: IChatElement<TExtraParts>,
      event: IChatEventMap[K],
    ) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  removeEventListener<K extends keyof IChatEventMap>(
    type: K,
    listener: (
      this: IChatElement<TExtraParts>,
      event: IChatEventMap[K],
    ) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

/** Props accepted by `<i-chat>` in TSX. */
type IChatEventProps = {
  [K in keyof IChatEventMap as `on${K}`]?: (event: IChatEventMap[K]) => void;
};

export interface IChatProps
  extends
    React.DetailedHTMLProps<
      React.HTMLAttributes<IChatElement<IChatParts>>,
      IChatElement<IChatParts>
    >,
    IChatEventProps {
  messages?: ExtendedChatMessage<IChatParts>[];
  config?: ChatConfig;
  emptyText?: string;
  placeholder?: string;
  disabled?: boolean;
  messageMode?: ChatMessageMode;
  showVoiceInput?: boolean;
  voiceLang?: string;
  voiceListeningLabel?: string;
  voiceDiagnostics?: boolean;
}

// React 19 (@types/react ^19): the JSX namespace lives inside the `react` module.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "i-chat": IChatProps;
    }
  }
}
```

Import the file once so the augmentation is loaded — importing `IChatElement` anywhere in the app is enough, or add it to `include` in `tsconfig.json`.

**React 18 and earlier** (`@types/react` ^18) use the _global_ JSX namespace, and only string attributes survive the render. Keep `IChatEventMap` and `IChatElement` exactly as above, then replace `IChatProps` and the augmentation with:

```ts
export interface IChatProps extends React.DetailedHTMLProps<
  React.HTMLAttributes<IChatElement<IChatParts>>,
  IChatElement<IChatParts>
> {
  placeholder?: string;
  emptytext?: string; // Lit lowercases `emptyText`
  "message-mode"?: "uncontrolled" | "controlled";
  "voice-lang"?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "i-chat": IChatProps;
    }
  }
}
```

Everything omitted here — `messages`, `config`, `disabled`, `showVoiceInput` — is assigned through the ref. Declaring them as JSX props would only invite React 18 to stringify them.

### Why not augment `HTMLElementEventMap`?

The tempting shortcut is:

```ts
// Don't do this
declare global {
  interface HTMLElementEventMap {
    send: CustomEvent<{ content: string }>;
    cancel: CustomEvent<null>;
  }
}
```

That adds these events to _every_ `HTMLElement` in the project and narrows built-in DOM events — `cancel`, `error`, and `select` already exist in `lib.dom.d.ts`, so redeclaring them changes their type everywhere, including on `<dialog>` and `<img>`. Scoping the overloads to `IChatElement` keeps the typing precise.

### Typed custom `x-*` parts

Fill in the `IChatParts` alias from `src/ichat.ts`. Write it as a **type alias**, not an `interface` — an interface has no implicit index signature, so it does not satisfy the ``Record<`x-${string}`, unknown>`` constraint that `Chat` imposes:

```ts
// src/ichat.ts
export type IChatParts = {
  "x-weather": { temp: number; unit: "C" | "F" };
};
```

That one edit flows through `IChatProps`, the ref, and `messages`, so `part.type` narrows to a concrete `data` shape everywhere:

```tsx
import { useEffect, useRef } from "react";
import type { ExtendedChatMessage } from "@bndynet/ichat";
import type { IChatElement, IChatParts } from "./ichat";

function Weather({
  messages,
}: {
  messages: ExtendedChatMessage<IChatParts>[];
}) {
  const ref = useRef<IChatElement<IChatParts>>(null);

  useEffect(() => {
    for (const part of ref.current?.messages[0]?.parts ?? []) {
      if (part.type === "x-weather") {
        console.log(part.data.temp, part.data.unit); // number, 'C' | 'F'
      }
    }
  }, [messages]);

  return <i-chat ref={ref} messages={messages} />;
}
```

Supplying a mapping removes the open-ended `CustomPart` (whose `data` is `unknown`) from the part union, which is what lets `part.data` resolve to a concrete shape. An `ExtendedChatMessage<IChatParts>` is still assignable to a plain `ChatMessage`, so it drops into existing signatures unchanged.

Keep the mapping in the same file as the JSX augmentation and use it everywhere. Because `JSX.IntrinsicElements` cannot be generic, its `ref` is pinned to whatever `IChatProps` declares — a `useRef<IChatElement<SomeOtherParts>>` will not be assignable to it:

```tsx
// ❌ Type 'IChatElement<MyParts>' is not assignable to type 'IChatElement<{}>'
const ref = useRef<IChatElement<MyParts>>(null);
return <i-chat ref={ref} />;
```

If you receive messages as plain `ChatMessage` — for example from a shared API layer you do not control — filter to custom parts and view them through `CustomPartOf` instead:

```ts
import {
  isCustomMessagePartType,
  type ChatMessage,
  type CustomPartOf,
} from "@bndynet/ichat";

function readWeatherLoose(message: ChatMessage) {
  for (const part of message.parts) {
    if (!isCustomMessagePartType(part.type)) continue;
    const custom = part as CustomPartOf<IChatParts>;
    if (custom.type === "x-weather") {
      console.log(custom.data.temp, custom.data.unit);
    }
  }
}
```

See [Generic type support](./component-api.md#generic-type-support) and [`registerPartRenderer`](./parts.md#x--custom-extension-parts).

---

## Slots and children

Slotted content is plain JSX — put `slot="…"` on direct children of `<i-chat>`:

```tsx
<i-chat ref={chatRef}>
  <div slot="empty" style={{ textAlign: "center" }}>
    <h2>How can I help?</h2>
  </div>
  <div slot="self-avatar">
    <img
      src={user.avatarUrl}
      alt=""
      style={{ width: "100%", borderRadius: "50%" }}
    />
  </div>
  <div slot="message-actions">
    <button type="button" data-action="copy">
      Copy
    </button>
    <button type="button" data-action="reply">
      Reply
    </button>
  </div>
</i-chat>
```

Slotted nodes stay in the light DOM, so your app's CSS (including CSS Modules and Tailwind classes) applies normally — use `className`, not `class`.

One exception: `message-actions` is read as a **template**. Its markup is serialized to an HTML string and re-rendered under every message row, so React event handlers attached to those buttons are lost. Use `data-action` and handle the resulting `message-action` event on the chat element instead:

```tsx
chatRef.current?.addEventListener("message-action", (event) => {
  const { action, message } = (event as CustomEvent).detail;
  if (action === "copy")
    void navigator.clipboard.writeText(getMessageText(message));
});
```

Replacing the composer entirely with `slot="input"` works the same way, but your React composer must dispatch a `send` `CustomEvent` with `bubbles: true` and `composed: true`, and mirror `busy-change` / `streaming-change` to disable itself. See [Slots on `<i-chat>`](./component-api.md#slots-on-i-chat).

---

## Composer interactions

Use `requestComposerInteraction()` when React needs to render a temporary form, selector, or other short workflow inside the composer area. Listen for the shared queue state, render `slot="composer-interaction"` only for a recognized and validated `x-*` request, and key the renderer by request ID so React discards the previous item's local form state.

```tsx
import { useEffect, useRef, useState } from "react";
import type { ChatComposerInteractionResolvedRequest } from "@bndynet/ichat";
import type { IChatElement, IChatEventMap } from "./ichat";

interface AddressPayload {
  title: string;
  defaults?: { city?: string; country?: string };
}

interface AddressValue {
  city: string;
  country: string;
}

type AddressRequest = ChatComposerInteractionResolvedRequest & {
  kind: "x-address-form";
  payload: AddressPayload;
};

function isAddressPayload(value: unknown): value is AddressPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as {
    title?: unknown;
    defaults?: { city?: unknown; country?: unknown };
  };
  if (typeof payload.title !== "string") return false;
  if (payload.defaults === undefined) return true;
  if (!payload.defaults || typeof payload.defaults !== "object") return false;
  return (
    (payload.defaults.city === undefined ||
      typeof payload.defaults.city === "string") &&
    (payload.defaults.country === undefined ||
      typeof payload.defaults.country === "string")
  );
}

function isAddressRequest(
  request: ChatComposerInteractionResolvedRequest | null,
): request is AddressRequest {
  return (
    request?.kind === "x-address-form" && isAddressPayload(request.payload)
  );
}

function isAddressValue(value: unknown): value is AddressValue {
  if (!value || typeof value !== "object") return false;
  const address = value as { city?: unknown; country?: unknown };
  return (
    typeof address.city === "string" && typeof address.country === "string"
  );
}

function AddressInteraction({
  request,
  onComplete,
  onCancel,
}: {
  request: AddressRequest;
  onComplete: (value: AddressValue) => void;
  onCancel: () => void;
}) {
  const [city, setCity] = useState(request.payload.defaults?.city ?? "");
  const [country, setCountry] = useState(
    request.payload.defaults?.country ?? "",
  );

  return (
    <section
      slot="composer-interaction"
      role="group"
      aria-label={request.ariaLabel ?? request.payload.title}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onComplete({ city, country });
        }}
      >
        <h3>{request.payload.title}</h3>
        <label>
          City
          <input
            autoFocus
            required
            value={city}
            onChange={(event) => setCity(event.currentTarget.value)}
          />
        </label>
        <label>
          Country
          <input
            required
            value={country}
            onChange={(event) => setCountry(event.currentTarget.value)}
          />
        </label>
        <button type="submit">Continue</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </section>
  );
}

export function ChatWithAddressInteraction() {
  const chatRef = useRef<IChatElement>(null);
  const [active, setActive] =
    useState<ChatComposerInteractionResolvedRequest | null>(null);

  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;

    setActive(chat.activeComposerInteraction);
    const onChange = (event: IChatEventMap["composer-interaction-change"]) => {
      setActive(event.detail.active);
    };

    chat.addEventListener("composer-interaction-change", onChange);
    return () =>
      chat.removeEventListener("composer-interaction-change", onChange);
  }, []);

  async function requestAddress() {
    const chat = chatRef.current;
    if (!chat) return;

    const result = await chat.requestComposerInteraction({
      kind: "x-address-form",
      ariaLabel: "Shipping address form",
      payload: { title: "Shipping address" },
    });

    if (result.status === "completed" && isAddressValue(result.value)) {
      // Persist the validated address in application code.
      console.log(result.value.city, result.value.country);
    }
  }

  const addressRequest = isAddressRequest(active) ? active : null;

  return (
    <>
      <button type="button" onClick={() => void requestAddress()}>
        Enter shipping address
      </button>
      <i-chat ref={chatRef}>
        {addressRequest && (
          <AddressInteraction
            key={addressRequest.id}
            request={addressRequest}
            onComplete={(value) => {
              chatRef.current?.completeComposerInteraction(
                addressRequest.id,
                value,
              );
            }}
            onCancel={() => {
              chatRef.current?.cancelComposerInteraction(addressRequest.id);
            }}
          />
        )}
      </i-chat>
    </>
  );
}
```

If the active kind is unknown or its payload fails validation, leave the slot unassigned so `<i-chat>` can show its safe fallback. Do not render raw HTML from `payload`; keep secrets out of it and validate both the request payload and the completed `value` at your application boundary.

`busy` remains independent of this queue. An active interaction blocks ordinary Send, but its Continue and Cancel actions must remain able to settle the matching active request. See [Custom composer interactions](./component-api.md#custom-composer-interactions) for mixed FIFO, stale-ID, AbortSignal, focus, and fallback contracts.

---

## Next.js and SSR

Importing `@bndynet/ichat` calls `customElements.define()` at module evaluation. `customElements` does not exist in Node, so a server-rendered import throws. Load the chat as a client-only component:

```tsx
// app/chat/page.tsx
"use client";
import dynamic from "next/dynamic";

const ChatPanel = dynamic(() => import("./ChatPanel"), {
  ssr: false,
  loading: () => <div>Loading chat…</div>,
});

export default function Page() {
  return <ChatPanel />;
}
```

Keep the `import '@bndynet/ichat'` inside `ChatPanel.tsx` so it is only ever reached in the browser bundle. Do not try to render `<i-chat>` on the server and upgrade it later: React 19 omits non-primitive props during SSR, and any prop set before the element upgrades lands as an attribute instead of a property.

---

## Pitfalls

| Symptom                                  | Cause                                                                        | Fix                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Nothing renders / zero height            | `<i-chat>` is `height: 100%`; the parent has no resolved height              | Give the container an explicit height or a flex layout with `min-height: 0`               |
| `config="[object Object]"` in the DOM    | React ≤ 18 stringifies unknown props                                         | Assign objects through the ref                                                            |
| Props land as attributes on React 19     | The element had not upgraded when React committed                            | Move `import '@bndynet/ichat'` to module scope                                            |
| Handler never fires                      | `onSend` instead of `onsend`, or `onCancel` hitting React's synthetic system | Use `addEventListener` with exact lowercase names                                         |
| Duplicate seed messages in dev           | StrictMode runs mount effects twice, and `addMessage` is additive            | Seed with `chat.messages = normalizeHistoryMessages(history)` — assignment is idempotent  |
| Message list re-renders constantly       | A new `config` object literal each render                                    | `useMemo` the config, or hoist it to module scope                                         |
| `TypeError: Cannot set property busy`    | `busy` is a getter                                                           | Read it, or listen for `busy-change`                                                      |
| Controlled UI freezes mid-stream         | The `messages-change` handler cloned or transformed the proposal             | Store `event.detail.messages` by reference                                                |
| Composer stays locked after an error     | The run never reached a terminal state                                       | Always call `complete()`, `fail()`, or `cancel()` — a `finally` block is the safest place |
| An old form settles the next interaction | The renderer reused local state or a stale request ID after FIFO advanced    | Key it by `active.id` and settle with that exact ID                                       |

---

## Next steps

- [`<i-chat>` API](./component-api.md) — full property, method, event, and slot reference
- [Message model](./message-model.md) — `ChatMessage` fields and the `parts[]` body
- [Parts](./parts.md) — reasoning, tool calls, todo panels, and custom `x-*` parts
- [Custom renderers](./renderers.md) — `registerCodeRenderer` and the built-in chart / KPI / form / Mermaid blocks
- [Theming](./theming.md) — the 12 base CSS tokens and the light/dark contract
- [Localization](./localization.md) — wiring `config.labels` to i18next or your own dictionary
