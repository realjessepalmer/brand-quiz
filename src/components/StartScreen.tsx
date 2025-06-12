import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="start-screen">
      <div className="start-content">
        <header className="start-header">
          <h1>Brand Archetype Quiz</h1>
          <p>Discover your brand's personality and connect with your audience</p>
        </header>
        
        <div className="start-instructions">
          <h2>What You'll Discover</h2>
          <p>This quiz will help you identify your brand's core archetype from 12 distinct personality types. Understanding your brand archetype will help you:</p>
          
          <ul>
            <li>Create more authentic messaging</li>
            <li>Connect emotionally with your audience</li>
            <li>Differentiate from competitors</li>
            <li>Guide strategic decisions</li>
          </ul>
          
          <h2>How It Works</h2>
          <p>You'll answer 7 questions that explore your brand's values, personality, and goals. Each question uses a different interaction style:</p>
          
          <ul>
            <li><strong>Ranking:</strong> Drag and drop to prioritize values</li>
            <li><strong>Choices:</strong> Select between different approaches</li>
            <li><strong>Ratings:</strong> Rate traits on a scale</li>
          </ul>
          
          <div className="time-estimate">
            <p><strong>Time:</strong> 5-7 minutes</p>
          </div>
        </div>
        
        <div className="start-actions">
          <button onClick={onStart} className="btn-primary start-button">
            Begin Quiz
          </button>
        </div>
      </div>
    </div>
  );
}