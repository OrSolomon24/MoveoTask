import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LobbyPage from './components/LobbyPage';
import CodeBlockPage from './components/CodeBlockPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LobbyPage />} />
                <Route path="/codeBlock/:id" element={<CodeBlockPage />} />
            </Routes>
        </Router>
    );
};

export default App;
