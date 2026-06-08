# Composer & interaction

Streaming state, reply (quote) blocks, and the default composer's voice input.

- [Streaming](#streaming)
- [Reply blocks](#reply-blocks)
- [Default composer voice input](#default-composer-voice-input)

## Streaming

The default composer already switches send ↔ cancel while streaming. For extra UI, listen to `streaming-change`:

```javascript
chatEl.addEventListener('streaming-change', (e) => {
  if (e.detail.streaming) { /* … */ }
});
```

## Reply blocks

Show quoted content **under** an existing message (e.g. after the user taps Reply in `message-actions`). The component only **renders** these blocks; you still own the composer (`<i-chat-input>` or `slot="input"`).

| Method | Returns | Description |
|--------|---------|-------------|
| `replyMessage(id, info?)` | `string` (block key) | Adds a quote block under the message with `id`. Each call **stacks** another block on the same message. `info` is optional display fields (`parts`, `avatar`, `role`, …) — you can pass the `ChatMessage` being quoted. |
| `clearReplyMessage(idOrKey?)` | — | Message `id` → remove **all** blocks under that message; block `key` from `replyMessage` → remove one block; omit → clear every reply block. No-op when nothing matches. **`removeMessage(id)`** also clears blocks for that `id`. |

Blocks reuse `<i-chat-message>` in quote mode (charts, forms, Mermaid fences, etc. still render). Style with `.message-replies`, `.message-reply`, and `.message--reply`.

**`message-action` example** (listen on `<i-chat>`; `detail.message` is the row that was acted on):

```javascript
chat.addEventListener('message-action', (e) => {
  const { action, message } = e.detail;
  if (action === 'reply') {
    chat.replyMessage(message.id, {
      id: message.id,
      parts: message.parts,
      role: message.role,
      avatar: message.avatar,
      timestamp: message.timestamp,
    });
  } else if (action === 'clear-reply') {
    chat.clearReplyMessage(message.id);
  }
});
```

```html
<div slot="message-actions">
  <button type="button" data-action="reply">Reply</button>
  <button type="button" data-action="clear-reply">Clear quote</button>
</div>
```

The same methods exist on **`<i-chat-messages>`** when you use the message list without `<i-chat>`.

## Default composer voice input

The built-in `<i-chat-input>` can show a voice button next to Send:

- `showVoiceInput=true` (default): render the voice button **only** when Web Speech API is supported by the current browser.
- `showVoiceInput=false`: never render the voice button.

```html
<!-- Hide voice button in the default composer -->
<i-chat show-voice-input="false"></i-chat>
```

On **`<i-chat>`**, you can set the same voice-related attributes; they are passed through to the default `<i-chat-input>` (ignored when using `slot="input"`):

- `show-voice-input`
- `voice-lang`
- `voice-listening-label`
- `voice-diagnostics`

When using `<i-chat-input>` directly, the same properties are available:

- `showVoiceInput` (`boolean`, default `true`)
- `voiceLang` (`string`, BCP 47, e.g. `zh-CN`, `en-US`; defaults to `navigator.language`)
- `voiceListeningLabel` (`string`, default `''`) — shown centered over the textarea while dictating; empty → localized default from `locale` / `labels.voiceListening`
- `voiceDiagnostics` (`boolean`, default `false`) — logs recognition milestones to the console (`console.debug`)
- `locale` (`string`, BCP 47; built-ins `en` / `zh` / `zh-CN`) and `labels` (`Partial<ComposerLabels>`) — localize the composer strings (placeholder, send/cancel/voice labels). Empty `placeholder` / `voiceListeningLabel` attributes fall back to these. `<i-chat>` forwards `config.locale` and `config.labels.composer` here automatically.

**Testing speech-to-text (Web Speech API):**

- Use a **supported browser** (e.g. **Chrome / Edge**; Safari has partial support; **Firefox** usually has no `SpeechRecognition`).
- Serve the page over **HTTPS** or **`http://localhost`** so the browser will prompt for **microphone** access; allow it when asked.
- **Chrome** typically sends audio to a **cloud** recognition service — you need **network access**; offline or blocked Google endpoints can yield no transcript.
- Match **`voice-lang`** to what you speak (e.g. `zh-CN` for Mandarin, `en-US` for American English).
- Open DevTools → **Console** if nothing appears: errors like `not-allowed` (permission) or `network` point to environment issues, not the component.

**If there is no transcript and no red errors in the console**, use **`voice-input` events** (they bubble with `composed: true`, so you can listen on `<i-chat>` or `document`). Expected order after clicking the mic:

| `detail.kind` | Meaning |
|---------------|---------|
| `session-started` | `start()` succeeded (`lang` in `detail`). |
| `recognition-started` | The recognition service actually began listening — if this never fires, the engine did not start. |
| `result` | (Only if `voice-diagnostics` / `voiceDiagnostics` is on) partial stats while text updates. |
| `error` | Always emitted for engine errors; check `detail.code` (`no-speech`, `network`, `not-allowed`, …). For `network`, `detail.hint` explains that Chrome needs outbound access to the speech backend. |
| `session-stopped` | You clicked the button to stop dictation. |
| `session-ended` | Dictation ended after a fatal error (e.g. `network`, `not-allowed`); the Listening overlay is cleared. |

**`detail.code === 'network'` (Chrome / Edge):** the browser could not reach the **remote speech recognition service** (not a bug in this component). Fix by: using a network that allows that traffic, disabling VPN/proxy that blocks it, trying another network, or using **server-side ASR** instead of Web Speech API for locked-down environments.

Enable extra logging: set **`voice-diagnostics`** on `<i-chat>` or `<i-chat-input>` (property `voiceDiagnostics`). That turns on `console.debug` lines (in Chrome you may need **Default levels → Verbose** to see them).

```javascript
document.querySelector('i-chat').addEventListener('voice-input', (e) => {
  console.log('voice-input', e.detail);
});
```
