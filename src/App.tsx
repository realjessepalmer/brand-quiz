import { QuizProvider } from './contexts/QuizContext';
import { useQuiz } from './contexts/QuizContext';
import { Quiz } from './components/Quiz';
import './App.css'

function AppContent() {
  const { state } = useQuiz();
  
  return (
    <div className="app">
      {/* Only show header on results screen */}
      {state.isComplete && (
        <header className="app-header">
          <h1>Brand Archetype Quiz</h1>
          <p>Discover your brand's personality and connect with your audience</p>
        </header>
      )}
      
      <main className="app-main">
        <Quiz />
      </main>
    </div>
  );
}

function App() {
  return (
    <QuizProvider>
      <AppContent />
    </QuizProvider>
  );
}

export default App
