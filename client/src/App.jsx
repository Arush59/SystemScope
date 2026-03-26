import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Editor from './pages/Editor';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <div className="bg-dark text-slate-100 min-h-screen font-sans antialiased flex flex-col">
        <Routes>
          <Route path="/" element={<Editor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
