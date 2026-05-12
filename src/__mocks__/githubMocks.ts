/**
 * Mock data for identifying a GitHub pull request.
 */
export const mockPullRequestData = {
  owner: 'owner',
  repo: 'repo',
  pullNumber: 123,
};

/**
 * A sample GitHub diff string used for testing diff parsing and AI review logic.
 */
export const mockGithubDiff = `diff --git a/src/app/page.tsx b/src/app/page.tsx
index 1234567..89abcdef 100644
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -10,1 +10,1 @@
-const x = 1;
+const pageCount = 1;`;
