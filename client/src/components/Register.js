import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Form } from 'react-bootstrap';

function Register({ setToken }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/.netlify/functions/auth/register', { name, email, password });
      setToken(response.data.token);
      toast.success('Registered successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="w-50 mx-auto">
      <h1 className="text-center mb-4">THE APP</h1>
      <p className="text-center mb-4">Start your journey<br />Register for The App</p>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Control type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Control type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100">Register</Button>
        <p className="text-center mt-3">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </Form>
    </div>
  );
}

export default Register;