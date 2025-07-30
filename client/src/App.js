import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserTable from './components/UserTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  return (
    <Router>
      <div className="container mt-4">
        <ToastContainer />
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/users" /> : <Login setToken={setToken} />} />
          <Route path="/register" element={token ? <Navigate to="/users" /> : <Register setToken={setToken} />} />
          <Route path="/users" element={!token ? <Navigate to="/login" /> : <UserTable token={token} setToken={setToken} />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;