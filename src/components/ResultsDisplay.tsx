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
    // Create detailed results text
    const resultsText = results.map((result, index) => {
      const archetype = archetypeMap.get(result.archetype);
      if (!archetype) return '';
      
      const position = index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Tertiary';
      return `${position}: ${archetype.name} (${result.percentage}%)`;
    }).filter(Boolean).join('\n');
    
    const brandNames = results
      .map(r => archetypeMap.get(r.archetype)?.name)
      .filter(Boolean)
      .join(' + ');
    
    const shareText = `🎯 My Brand Archetype Results:

${resultsText}

I'm a ${brandNames} brand archetype combination!

Take the Brand Archetype Quiz: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Brand Archetype Results',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.warn('Error sharing:', error);
        // Fallback to clipboard
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };
  
  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        // Show success feedback
        showCopyFeedback();
      } catch (error) {
        console.warn('Error copying to clipboard:', error);
        // Fallback to older method
        fallbackCopyTextToClipboard(text);
      }
    } else {
      fallbackCopyTextToClipboard(text);
    }
  };
  
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      showCopyFeedback();
    } catch (err) {
      console.warn('Fallback: Unable to copy', err);
    }
    
    document.body.removeChild(textArea);
  };
  
  const showCopyFeedback = () => {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = 'Results copied to clipboard!';
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(feedback)) {
          document.body.removeChild(feedback);
        }
      }, 300);
    }, 3000);
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