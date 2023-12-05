---
title: Marble testing for rxjs
categories: [Programming,Web,JavaScript]
tags: [Programming,Web,JavaScript]
---

[https://www.notion.so/Marble-testing-for-rxjs-5e583c7454c349b18a6626c69f62befb](https://www.notion.so/Marble-testing-for-rxjs-5e583c7454c349b18a6626c69f62befb)


## Examples


`'-'` or `'------'`: Equivalent to `[NEVER](<https://rxjs.dev/api/index/const/NEVER>)`, or an observable that never emits or errors or completes.


`|`: Equivalent to `[EMPTY](<https://rxjs.dev/api/index/const/EMPTY>)`, or an observable that never emits and completes immediately.


`#`: Equivalent to `[throwError](<https://rxjs.dev/api/index/function/throwError>)`, or an observable that never emits and errors immediately.


`'--a--'`: An observable that waits 2 "frames", emits value `a` on frame 2 and then never completes.


`'--a--b--|'`: On frame 2 emit `a`, on frame 5 emit `b`, and on frame 8, `complete`.


`'--a--b--#'`: On frame 2 emit `a`, on frame 5 emit `b`, and on frame 8, `error`.


`'-a-^-b--|'`: In a hot observable, on frame -2 emit `a`, then on frame 2 emit `b`, and on frame 5, `complete`.


`'--(abc)-|'`: on frame 2 emit `a`, `b`, and `c`, then on frame 8, `complete`.


`'-----(a|)'`: on frame 5 emit `a` and `complete`.


`'a 9ms b 9s c|'`: on frame 0 emit `a`, on frame 10 emit `b`, on frame 9,011 emit `c`, then on frame 9,012 `complete`.


`'--a 2.5m b'`: on frame 2 emit `a`, on frame 150,003 emit `b` and never complete.


```typescript
import { TestScheduler } from 'rxjs/testing';
import { throttleTime } from 'rxjs';

const testScheduler = new TestScheduler((actual, expected) => {
  // asserting the two objects are equal - required
  // for TestScheduler assertions to work via your test framework
  // e.g. using chai.
  expect(actual).deep.equal(expected);
});

// This test runs synchronously.
it('generates the stream correctly', () => {
  testScheduler.run((helpers) => {
    const { cold, time, expectObservable, expectSubscriptions } = helpers;
    const e1 = cold(' -a--b--c---|');
    const e1subs = '  ^----------!';
    const t = time('   ---|       '); // t = 3
    const expected = '-a-----c---|';

    expectObservable(e1.pipe(throttleTime(t))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  testScheduler.run((helpers) => {
	  const { time, cold } = helpers;
	  const source = cold('---a--b--|');
	  const t = time('        --|    ');
	  //                         --|
	  const expected = '   -----a--b|';
	  const result = source.pipe(delay(t));
	  expectObservable(result).toBe(expected);
	});

  testScheduler.run((helpers) => {
	  const { animate, cold } = helpers;
	  animate('              ---x---x---x---x');
	  const requests = cold('-r-------r------');
	  /* ... */
	  const expected = '     ---a-------b----';
	});
});
```

