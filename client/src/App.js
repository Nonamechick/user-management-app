import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
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
        <Switch>
          <Route path="/login">
            {token ? <Redirect to="/users" /> : <Login setToken={setToken} />}
          </Route>
          <Route path="/register">
            {token ? <Redirect to="/users" /> : <Register setToken={setToken} />}
          </Route>
          <Route path="/users">
            {!token ? <Redirect to="/login" /> : <UserTable token={token} setToken={setToken} />}
          </Route>
          <Route path="/">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;