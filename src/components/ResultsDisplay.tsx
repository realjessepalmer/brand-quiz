import React, { useMemo } from 'react';
import { ArchetypeResult, Archetype } from '../types';
import quizData from '../quiz-data.json';

interface ResultsDisplayProps {
  results: ArchetypeResult[];
  onRestart: () => void;
}

const getResultLabel = (resultCount: number): string => {
  switch (resultCount) {
    case 1:
      return "Your Dominant Brand Archetype";
    case 2:
      return "Your Brand Archetype Blend";
    default:
      return "Your Brand Archetype Mix";
  }
};

const ArchetypeCard = ({ result, archetypeData }: { result: ArchetypeResult; archetypeData: Archetype }) => (
  <div className="archetype-card">
    <div 
      className="archetype-header"
      style={{ backgroundColor: archetypeData.color }}
    >
      <h2 className="archetype-name">{archetypeData.name}</h2>
      <div className="archetype-strength">
        {result.strength} • {result.percentage}%
      </div>
    </div>

    <div className="archetype-content">
      <p className="archetype-description">
        {archetypeData.description}
      </p>

      <div className="archetype-traits">
        <h3>Key Traits</h3>
        <div className="traits-list">
          {archetypeData.traits.map((trait, index) => (
            <span key={index} className="trait-tag">
              {trait}
            </span>
          ))}
        </div>
      </div>

      <div className="archetype-examples">
        <h3>Brand Examples</h3>
        <div className="examples-list">
          {archetypeData.examples.map((example, index) => (
            <span key={index} className="example-tag">
              {example}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ShareButton = ({ results, archetypeMap }: { results: ArchetypeResult[]; archetypeMap: Map<string, Archetype> }) => {
  const handleShare = async () => {
    const brandNames = results
      .map(r => archetypeMap.get(r.archetype)?.name)
      .filter(Boolean)
      .join(' + ');
    
    const shareText = `I'm a ${brandNames} brand!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Brand Archetype Results',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.warn('Error sharing:', error);
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      } catch (error) {
        console.warn('Error copying to clipboard:', error);
      }
    }
  };
  
  return (
    <button 
      onClick={handleShare}
      className="btn-primary"
      aria-label="Share your brand archetype results"
    >
      Share Results
    </button>
  );
};

export function ResultsDisplay({ results, onRestart }: ResultsDisplayProps) {
  const archetypeMap = useMemo(() => 
    new Map(quizData.archetypes.map(arch => [arch.id, arch])), 
    []
  );
  
  const getArchetypeData = (archetypeId: string): Archetype | undefined => {
    return archetypeMap.get(archetypeId);
  };

  if (results.length === 0) {
    return (
      <div className="results-container">
        <h2>Unable to determine your brand archetype</h2>
        <p>Please try taking the quiz again with more definitive answers.</p>
        <button onClick={onRestart} className="btn-primary">
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="results-container mobile-optimized">
      <div className="results-header">
        <h1 className="results-title">{getResultLabel(results.length)}</h1>
        <div className="results-summary">
          {results.map((result) => {
            const archetypeData = getArchetypeData(result.archetype);
            return archetypeData ? (
              <div key={result.archetype} className="result-pill">
                <span className="archetype-name">{archetypeData.name}</span>
                <span className="percentage">{result.percentage}%</span>
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div className="results-content">
        <div className="archetype-details">
          {results.map((result) => {
            const archetypeData = getArchetypeData(result.archetype);
            return archetypeData ? (
              <ArchetypeCard 
                key={result.archetype} 
                result={result} 
                archetypeData={archetypeData} 
              />
            ) : null;
          })}
        </div>

        <div className="results-actions">
          <button 
            onClick={onRestart} 
            className="btn-secondary"
            aria-label="Retake the brand archetype quiz"
          >
            Take Quiz Again
          </button>
          <ShareButton results={results} archetypeMap={archetypeMap} />
        </div>
      </div>
    </div>
  );
}