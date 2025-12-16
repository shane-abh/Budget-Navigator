import { useState } from 'react';
import type { QueryOptimization as QueryOptimizationType } from '../types';

interface QueryOptimizationProps {
  optimization: QueryOptimizationType;
}

function QueryOptimization({ optimization }: QueryOptimizationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="query-optimization accordion">
      <button 
        className="accordion-header" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>🔍 Query Optimization</span>
        <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div className="original">
          <span className="label">Original Query:</span>
          {optimization.original}
        </div>
        {optimization.rewritten && (
          <div className="rewritten">
            <span className="label">Rewritten Query:</span>
            {optimization.rewritten}
          </div>
        )}
        {optimization.expanded && optimization.expanded.length > 0 && (
          <div className="expanded">
            <span className="label">Expanded Terms:</span>
            <div className="terms">
              {optimization.expanded.map((term, i) => (
                <span key={i} className="term">{term}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QueryOptimization;






