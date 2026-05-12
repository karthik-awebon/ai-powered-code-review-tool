import { AiReviewComment } from '../types';

function parseDiffFiles(diff: string): string[] {
  const files: string[] = [];
  const lines = diff.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('+++ b/')) {
      files.push(line.slice(6));
    }
  }
  return files.length ? files : ['unknown-file.ts'];
}

export async function* simulateLLMReviewStream(diff: string): AsyncGenerator<AiReviewComment, void, unknown> {
  const files = parseDiffFiles(diff);
  let idCounter = 1;

  for (const file of files) {
    const commentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));
      
      const confidence = Math.random();
      let severity: 'suggestion' | 'warning' | 'critical' = 'suggestion';
      
      if (confidence > 0.8) severity = 'critical';
      else if (confidence > 0.5) severity = 'warning';

      const contents = [
        `Consider extracting this logic into a custom hook.`,
        `This pattern might cause a memory leak if not cleaned up properly.`,
        `Nice use of composition here!`,
        `Missing type definitions for this prop. Please use explicit Zod schemas.`,
        `Ensure this asynchronous state is handled gracefully with Suspense.`
      ];
      
      yield {
        id: `comment-${Date.now()}-${idCounter++}`,
        filePath: file,
        lineNumber: 10 + i * 5, // Mock line number
        content: contents[Math.floor(Math.random() * contents.length)],
        confidence,
        severity
      };
    }
  }
}
