import { APP_CONFIG } from '../constants';

/**
 * Extracts a specific snippet from a unified diff string, including surrounding context.
 * 
 * @param fullDiff - The complete git diff string.
 * @param targetFile - The path of the file to extract the snippet from.
 * @param targetLine - The line number in the new version of the file.
 * @param contextLines - Number of lines of context to include before and after the target line.
 * @returns The extracted diff snippet as a string, or undefined if the file or line is not found.
 */
export function extractSnippetFromDiff(
  fullDiff: string,
  targetFile: string,
  targetLine: number,
  contextLines: number = APP_CONFIG.REVIEW.DIFF_CONTEXT_LINES
): string | undefined {
  const lines = fullDiff.split('\n');
  
  let inTargetFile = false;
  let currentNewLine = 0;
  let chunkLines: { line: string; newLineNum: number | null }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect file boundary
    if (line.startsWith('diff --git ')) {
      // Check if it's our target file (look for " b/targetFile" or handle quotes)
      const bFile = ` b/${targetFile}`;
      if (line.endsWith(bFile) || line.includes(` b/${targetFile} `)) {
        inTargetFile = true;
      } else {
        if (inTargetFile) {
          // We left the target file, process what we have
          break;
        }
      }
      continue;
    }

    if (!inTargetFile) continue;

    // We are in the target file diff
    if (line.startsWith('@@ ')) {
      // Parse chunk header: @@ -old,oldCnt +new,newCnt @@
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        currentNewLine = parseInt(match[1], 10);
        // Clear previous chunk lines if we didn't find the target yet
        // since the target must be within a single chunk
        chunkLines = [];
      }
      continue;
    }

    if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('index ')) {
      continue;
    }

    // Process chunk lines
    let lineObj: { line: string; newLineNum: number | null } = { line, newLineNum: null };

    if (line.startsWith('+') || line.startsWith(' ')) {
      lineObj.newLineNum = currentNewLine;
      currentNewLine++;
    } else if (line.startsWith('-')) {
      // Doesn't exist in the new file, so no new line number
      lineObj.newLineNum = null;
    }

    // Ignore "\ No newline at end of file"
    if (line.startsWith('\\')) {
      continue;
    }

    chunkLines.push(lineObj);

    // If we passed the target line sufficiently, we can stop and extract
    if (lineObj.newLineNum === targetLine) {
      // We found the line, but we want to collect a few more context lines
      // Let's keep collecting until we have enough context after, then break.
    } else if (
      lineObj.newLineNum !== null &&
      lineObj.newLineNum > targetLine + contextLines
    ) {
      break; // Collected enough after target
    }
  }

  if (!inTargetFile || chunkLines.length === 0) {
    return undefined;
  }

  // Find the index of the target line
  const targetIndex = chunkLines.findIndex((l) => l.newLineNum === targetLine);
  if (targetIndex === -1) {
    return undefined; // Target line not found in the diff chunks
  }

  // Extract surrounding context
  const start = Math.max(0, targetIndex - contextLines);
  const end = Math.min(chunkLines.length - 1, targetIndex + contextLines);
  
  const snippetLines = chunkLines.slice(start, end + 1).map((l) => l.line);
  return snippetLines.join('\n');
}
