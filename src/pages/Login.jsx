import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/account');
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Log In</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Log In</button>
        </form>
        <p style={styles.link}>
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh - 80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--bg-color)',
    padding: '2rem',
  },
  card: {
    backgroundColor: 'var(--surface-color)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.6rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    backgroundColor: 'var(--surface-color)',
    color: 'var(--text-color)',
    border: '1px solid #30363d',
    padding: '0.6rem 1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '1rem',
    outline: 'none',
    width: '100%',
  },
  button: {
    backgroundColor: 'var(--accent-color)',
    color: '#fff',
    padding: '0.75rem',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'var(--transition)',
  },
  error: {
    color: 'red',
    marginTop: '-0.5rem',
    fontSize: '0.9rem',
  },
  link: {
    marginTop: '1rem',
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
  },
};

export default Login;
