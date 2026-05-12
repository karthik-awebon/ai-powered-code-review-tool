import { describe, it, expect } from 'vitest';
import { extractSnippetFromDiff } from './diff';

describe('extractSnippetFromDiff', () => {
  const sampleDiff = `diff --git a/src/app/actions/review.ts b/src/app/actions/review.ts
index e69de29..d95f3ad 100644
--- a/src/app/actions/review.ts
+++ b/src/app/actions/review.ts
@@ -10,6 +10,7 @@
   if (!prDetails) {
     logger.warn({ url }, 'Invalid GitHub PR URL provided');
-    return { error: 'Invalid GitHub PR URL' };
+    return { error: 'Invalid URL format' };
+    // Added a new comment
   }
 
   try {
@@ -25,3 +26,3 @@
diff --git a/src/components/ui/ReviewComment.tsx b/src/components/ui/ReviewComment.tsx
index 1234567..89abcdef 100644
--- a/src/components/ui/ReviewComment.tsx
+++ b/src/components/ui/ReviewComment.tsx
@@ -5,2 +5,3 @@
   const [isCollapsed, setIsCollapsed] = useState(comment.confidence < 0.5);
+  const isCritical = comment.severity === 'critical';
 `;

  it('extracts snippet correctly for a given file and line', () => {
    // target line 12 is the newly added line
    const snippet = extractSnippetFromDiff(sampleDiff, 'src/app/actions/review.ts', 12, 1);
    expect(snippet).toBeDefined();
    // Context = 1 physical line before and after
    expect(snippet).toBe(
      "-    return { error: 'Invalid GitHub PR URL' };\n" +
      "+    return { error: 'Invalid URL format' };\n" +
      "+    // Added a new comment"
    );
  });

  it('returns undefined if file not in diff', () => {
    const snippet = extractSnippetFromDiff(sampleDiff, 'src/unknown.ts', 12);
    expect(snippet).toBeUndefined();
  });

  it('returns undefined if line not in diff chunk', () => {
    const snippet = extractSnippetFromDiff(sampleDiff, 'src/app/actions/review.ts', 99);
    expect(snippet).toBeUndefined();
  });

  it('extracts from second file in diff', () => {
    const snippet = extractSnippetFromDiff(sampleDiff, 'src/components/ui/ReviewComment.tsx', 6, 0);
    expect(snippet).toBeDefined();
    expect(snippet).toBe("+  const isCritical = comment.severity === 'critical';");
  });
});
