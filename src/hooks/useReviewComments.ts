import { useState, useMemo } from 'react';
import { AiReviewComment } from '../types';

export type SortOrder = 'none' | 'desc' | 'asc';

export function useReviewComments(comments: AiReviewComment[]) {
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);
  const [sortByConfidence, setSortByConfidence] = useState<SortOrder>('none');

  const groupedComments = useMemo(() => {
    let processed = comments;

    // Filter
    if (showOnlyCritical) {
      processed = processed.filter(c => c.severity === 'critical');
    }

    // Sort
    if (sortByConfidence !== 'none') {
      processed = [...processed].sort((a, b) => {
        if (sortByConfidence === 'desc') {
          return b.confidence - a.confidence;
        }
        return a.confidence - b.confidence;
      });
    }

    // Group by filePath
    const groups: Record<string, AiReviewComment[]> = {};
    processed.forEach(comment => {
      if (!groups[comment.filePath]) {
        groups[comment.filePath] = [];
      }
      groups[comment.filePath].push(comment);
    });

    return groups;
  }, [comments, showOnlyCritical, sortByConfidence]);

  return {
    showOnlyCritical,
    setShowOnlyCritical,
    sortByConfidence,
    setSortByConfidence,
    groupedComments,
    hasComments: comments.length > 0
  };
}
