import { QuizProvider } from './contexts/QuizContext';
import { Quiz } from './components/Quiz';
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Brand Archetype Quiz</h1>
        <p>Discover your brand's personality and connect with your audience</p>
      </header>
      
      <main className="app-main">
        <QuizProvider>
          <Quiz />
        </QuizProvider>
      </main>
    </div>
  );
}

export default App
