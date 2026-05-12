import { describe, it, expect } from 'vitest';
import { getLLMReviewStream } from '../services/llm';

describe('LLM Review Integration', () => {
  it('should return multiple comments for the react.dev PR diff', async () => {
    const diff = `diff --git a/src/content/reference/react-dom/components/form.md b/src/content/reference/react-dom/components/form.md
index 1043b13a0de..ac5ff6a667e 100644
--- a/src/content/reference/react-dom/components/form.md
+++ b/src/content/reference/react-dom/components/form.md
@@ -334,7 +334,7 @@ Learn more about updating state from a form action with the [\`useActionState\`](/
 
 ### Handling multiple submission types {/*handling-multiple-submission-types*/}
 
-Forms can be designed to handle multiple submission actions based on the button pressed by the user. Each button inside a form can be associated with a distinct action or behavior by setting the \`formAction\` prop.
+Forms can be designed to handle multiple submission Actions based on the button pressed by the user. Each button inside a form can be associated with a distinct action or behavior by setting the \`formAction\` prop.
 
 When a user taps a specific button, the form is submitted, and a corresponding action, defined by that button's attributes and action, is executed. For instance, a form might submit an article for review by default but have a separate button with \`formAction\` set to save the article as a draft.
 
diff --git a/src/content/reference/react/useActionState.md b/src/content/reference/react/useActionState.md
index 581eebc634b..d065b9de8a4 100644
--- a/src/content/reference/react/useActionState.md
+++ b/src/content/reference/react/useActionState.md
@@ -60,7 +60,7 @@ function MyCart({initialState}) {
 * The \`dispatchAction\` function has a stable identity, so you will often see it omitted from Effect dependencies, but including it will not cause the Effect to fire. If the linter lets you omit a dependency without errors, it is safe to do. [Learn more about removing Effect dependencies.](/learn/removing-effect-dependencies#move-dynamic-objects-and-functions-inside-your-effect)
 * When using the \`permalink\` option, ensure the same form component is rendered on the destination page (including the same \`reducerAction\` and \`permalink\`) so React knows how to pass the state through. Once the page becomes interactive, this parameter has no effect.
 * When using Server Functions, \`initialState\` needs to be [serializable](/reference/rsc/use-server#serializable-parameters-and-return-values) (values like plain objects, arrays, strings, and numbers).
-* If \`dispatchAction\` throws an error, React cancels all queued actions and shows the nearest [Error Boundary](/reference/react/Component#catching-rendering-errors-with-an-error-boundary).
+* If \`dispatchAction\` throws an error, React cancels all queued Actions and shows the nearest [Error Boundary](/reference/react/Component#catching-rendering-errors-with-an-error-boundary).
 * If there are multiple ongoing Actions, React batches them together. This is a limitation that may be removed in a future release.
 
 <Note>
@@ -100,7 +100,7 @@ Each time you call \`dispatchAction\`, React calls the \`reducerAction\` with the \`a
 
 #### Caveats {/*reduceraction-caveats*/}
 
-* \`reducerAction\` can be sync or async. It can perform sync actions like showing a notification, or async actions like posting updates to a server.
+* \`reducerAction\` can be sync or async. It can perform sync Actions like showing a notification, or async Actions like posting updates to a server.
 * \`reducerAction\` is not invoked twice in \`<StrictMode>\` since \`reducerAction\` is designed to allow side effects.
 * The return type of \`reducerAction\` must match the type of \`initialState\`. If TypeScript infers a mismatch, you may need to explicitly annotate your state type.
 * If you set state after \`await\` in the \`reducerAction\` you currently need to wrap the state update in an additional \`startTransition\`. See the [startTransition](/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-transition) docs for more info.
diff --git a/src/content/reference/react/useTransition.md b/src/content/reference/react/useTransition.md
index 426df1f7b26..893e0fc8ad9 100644
--- a/src/content/reference/react/useTransition.md
+++ b/src/content/reference/react/useTransition.md
@@ -309,7 +309,7 @@ This is a basic example to demonstrate how Actions work, but this example does n
 
 For common use cases, React provides built-in abstractions such as:
 - [\`useActionState\`](/reference/react/useActionState)
-- [\`<form>\` actions](/reference/react-dom/components/form)
+- [\`<form>\` Actions](/reference/react-dom/components/form)
 - [Server Functions](/reference/rsc/server-functions)
 
 These solutions handle request ordering for you. When using Transitions to build your own custom hooks or libraries that manage async state transitions, you have greater control over the request ordering, but you must handle it yourself.
@@ -1248,7 +1248,7 @@ This is recommended for three reasons:
 
 - [Transitions are interruptible,](#perform-non-blocking-updates-with-actions) which lets the user click away without waiting for the re-render to complete.
 - [Transitions prevent unwanted loading indicators,](#preventing-unwanted-loading-indicators) which lets the user avoid jarring jumps on navigation.
-- [Transitions wait for all pending actions](#perform-non-blocking-updates-with-actions) which lets the user wait for side effects to complete before the new page is shown.
+- [Transitions wait for all pending Actions](#perform-non-blocking-updates-with-actions) which lets the user wait for side effects to complete before the new page is shown.
 
 Here is a simplified router example using Transitions for navigations.
 
@@ -1945,7 +1945,7 @@ export async function updateQuantity(newName) {
 
 When clicking multiple times, it's possible for previous requests to finish after later requests. When this happens, React currently has no way to know the intended order. This is because the updates are scheduled asynchronously, and React loses context of the order across the async boundary.
 
-This is expected, because Actions within a Transition do not guarantee execution order. For common use cases, React provides higher-level abstractions like [\`useActionState\`](/reference/react/useActionState) and [\`<form>\` actions](/reference/react-dom/components/form) that handle ordering for you. For advanced use cases, you'll need to implement your own queuing and abort logic to handle this.
+This is expected, because Actions within a Transition do not guarantee execution order. For common use cases, React provides higher-level abstractions like [\`useActionState\`](/reference/react/useActionState) and [\`<form>\` Actions](/reference/react-dom/components/form) that handle ordering for you. For advanced use cases, you'll need to implement your own queuing and abort logic to handle this.
 
 
 Example of \`useActionState\` handling execution order:`;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn('Skipping LLM integration test: GOOGLE_GENERATIVE_AI_API_KEY not found');
      return;
    }

    const stream = getLLMReviewStream(diff);
    const comments = [];
    for await (const comment of stream) {
      comments.push(comment);
    }

    console.log('Comments received:', comments.length);
    for (const c of comments) {
      console.log(`[${c.severity}] ${c.filePath}:${c.lineNumber} - ${c.content.substring(0, 50)}`);
    }

    expect(comments.length).toBeGreaterThan(1);
  }, 30000);
});
