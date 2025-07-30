import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Form } from 'react-bootstrap';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/.netlify/functions/auth/login', { email, password });
      setToken(response.data.token);
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="w-50 mx-auto">
      <h1 className="text-center mb-4">THE APP</h1>
      <p className="text-center mb-4">Start your journey<br />Sign In to The App</p>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Control type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Form.Check type="checkbox" label="Remember me" className="mb-3" />
        <Button variant="primary" type="submit" className="w-100">Sign In</Button>
        <p className="text-center mt-3">
          Don't have an account? <a href="/register">Sign up</a> | <a href="#">Forgot password?</a>
        </p>
      </Form>
    </div>
  );
}

export default Login;