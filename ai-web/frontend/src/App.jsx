// Application shell with routing for different feature pages.
//
// Uses React Router to provide separate pages for each demo feature,
// making navigation cleaner and allowing each feature to have dedicated space.
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ChatbotPage } from './pages/ChatbotPage';
import { EchoPage } from './pages/EchoPage';
import { LessonOutlinePage } from './pages/LessonOutlinePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/echo" element={<EchoPage />} />
        <Route path="/lesson-outline" element={<LessonOutlinePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
