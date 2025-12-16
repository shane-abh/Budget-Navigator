/**
 * Preprocess markdown content to ensure better paragraph breaks
 */
export function preprocessContent(content: string): string {
  let processed = content;

  // Add extra line break before bullet points if not already there
  processed = processed.replace(/([^\n])\n(\s*[*-]\s)/g, '$1\n\n$2');

  // Add extra line break after bullet point sections before regular text
  processed = processed.replace(/(\s*[*-]\s[^\n]+)\n([^\n*-])/g, '$1\n\n$2');

  // Ensure proper spacing after colons followed by lists
  processed = processed.replace(/:\s*\n(\s*[*-]\s)/g, ':\n\n$1');

  return processed;
}

