# Todo panel

Use a structured `todo` message part for an ordered plan that must remain visible, collapsible, and independently updateable while an assistant works.

## Data model

```typescript
type TodoItemStatus = 'pending' | 'active' | 'done' | 'error' | 'skipped';

interface TodoItem {
  id: string;
  title: string;
  status: TodoItemStatus;
  description?: string;
}

interface TodoPart {
  id: string;
  type: 'todo';
  title?: string;
  items: TodoItem[];
  revision: number;
  defaultCollapsed?: boolean;
  interactive?: boolean;
  status?: 'pending' | 'streaming' | 'complete' | 'error' | 'cancelled';
}
```

The header count and completed progress are derived from `items`. Expanded state is local to `<i-chat-todo>`, so `updateTodoItem()` does not reopen a panel the user collapsed.

## Create a todo

```javascript
import { textPart, todoPart } from '@bndynet/ichat';

chat.addMessage({
  id: 'assistant-42',
  role: 'assistant',
  parts: [
    textPart('I will follow this plan:'),
    todoPart(
      [
        { id: 'model', title: 'Define the data model', status: 'done' },
        { id: 'panel', title: 'Build the panel', status: 'active' },
        { id: 'verify', title: 'Verify the build', status: 'pending' },
      ],
      { id: 'plan', status: 'streaming' },
    ),
  ],
});
```

Set `interactive: false` when the panel is display-only. `defaultCollapsed` affects only the initial render.

## Update an item

`updateTodoItem(messageId, partId, itemId, patch, revision?)` replaces the item and `items` array immutably. It returns `false` when the message, part, or item is missing, when a status/revision is invalid, or when an explicit revision is stale. Use `tryUpdateTodoItem()` when you need the exact failure reason.

```javascript
chat.updateTodoItem('assistant-42', 'plan', 'panel', { status: 'done' }, 3);
chat.updateTodoItem('assistant-42', 'plan', 'verify', { status: 'active' }, 4);

const result = chat.tryUpdateTodoItem('assistant-42', 'plan', 'verify', { status: 'done' }, 5);
if (!result.ok) {
  console.warn('Todo update ignored:', result.reason);
}
```

When every item is `done` or `skipped`, the part lifecycle status becomes `complete`. Updating a completed todo back to a non-terminal state changes the lifecycle to `streaming`.

For SSE, send stable IDs and a monotonic revision:

```json
{
  "type": "todo.item.updated",
  "messageId": "assistant-42",
  "partId": "plan",
  "itemId": "panel",
  "status": "done",
  "revision": 3,
  "sequence_number": 18
}
```

`sequence_number` orders the stream event itself. `revision` belongs to the todo
part and is used to reject stale item updates; keep both monotonic, but do not
reuse one as the other.

Then route the event through the same reducer as UI changes:

```javascript
source.addEventListener('todo.item.updated', (event) => {
  const result = chat.tryApplyTodoItemUpdateEvent(event);
  if (!result.ok) {
    console.warn('Todo event ignored:', result.reason);
  }
});
```

For custom adapters, `normalizeTodoItemUpdateEvent(event)` is exported separately. The older `patchTodoItemInPart()` helper remains as a deprecated compatibility alias for `patchTodoItem()`.

## Handle user changes

Clicking a status icon requests the next status but does not mutate the component's input. Handle the bubbling `part-action` event and apply the update locally, persist it remotely, or reject it.

```javascript
chat.addEventListener('part-action', (event) => {
  if (event.detail.kind !== 'todo') return;
  const { messageId, part, itemId, status } = event.detail.detail;
  chat.updateTodoItem(messageId, part.id, itemId, { status });
});
```

The legacy `todo-action` event is still emitted as a deprecated compatibility event and should only be removed in a future major version:

```javascript
chat.addEventListener('todo-action', (event) => {
  const { messageId, part, itemId, status } = event.detail;
  chat.updateTodoItem(messageId, part.id, itemId, { status });
});
```

Event detail includes `action`, `itemId`, `previousStatus`, requested `status`, `part`, `messageId`, and `message`.

## Theme tokens

The panel derives from the shared `--chat-panel-*` tokens and then the normal `--chat-*` palette. Override only when the todo needs a distinct treatment:

| Property | Purpose |
|----------|---------|
| `--chat-todo-bg` | Panel background |
| `--chat-todo-border` | Border and row dividers |
| `--chat-todo-shadow` | Panel shadow |
| `--chat-todo-text` | Primary text |
| `--chat-todo-secondary` | Secondary text and inactive icons |
| `--chat-todo-active` | Active item icon |
| `--chat-todo-done` | Completed item icon |
| `--chat-todo-error` | Failed item icon |
| `--chat-todo-radius` | Panel corner radius |
