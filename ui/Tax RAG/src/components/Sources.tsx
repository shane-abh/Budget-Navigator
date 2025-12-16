import { useState } from 'react';
import type { Source } from '../types';

interface SourcesProps {
  sources: Source[];
  totalDocs: number;
}

function Sources({ sources, totalDocs }: SourcesProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sources accordion">
      <button 
        className="accordion-header" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>📚 Sources ({totalDocs} documents found)</span>
        <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        {sources.map((source, i) => (
          <div key={i} className="source-item">
            <strong>{source.source_file}</strong> (Page {source.page})<br />
            <small>{source.preview}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sources;






