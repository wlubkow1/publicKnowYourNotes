import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Upcoming() {
  const [fragrances, setFragrances] = useState([]);

  useEffect(() => {
    async function fetchUnreleased() {
      const { data, error } = await supabase
        .from('fragrances')
        .select('*')
        .eq('released', false)
        .order('name', { ascending: true });

      if (error) console.error('Error fetching upcoming fragrances:', error);
      else setFragrances(data);
    }

    fetchUnreleased();
  }, []);

  return (
    <div className="page" style={styles.page}>
      <h1 style={styles.heading}>Upcoming Fragrances</h1>

      <div style={styles.list}>
        {fragrances.map(f => (
          <Link key={f.id} to={`/fragrance/${f.id}`} style={styles.item}>
            <img src={f.image_url} alt={f.name} style={styles.image} />
            <div style={styles.info}>
              <h3 style={styles.name}>{f.name}</h3>
              <p style={styles.brand}>Brand: {f.brand}</p>
              <p style={styles.year}>Expected: {f.year || 'TBD'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '2rem',
    color: 'var(--text-color)',
  },
  heading: {
    fontSize: '2.2rem',
    marginBottom: '2rem',
    fontWeight: 700,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    backgroundColor: '#1c1f26',
    padding: '1.25rem 1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'background 0.2s ease, transform 0.2s ease',
    color: 'inherit',
  },
  image: {
    width: 90,
    height: 90,
    objectFit: 'contain',
    borderRadius: '8px',
    marginRight: '1.75rem',
    flexShrink: 0,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--accent-color)',
    marginBottom: '0.4rem',
  },
  brand: {
    fontSize: '1rem',
    color: '#aaa',
    marginBottom: '0.2rem',
  },
  year: {
    fontSize: '0.95rem',
    color: '#888',
  },
};

export default Upcoming;
