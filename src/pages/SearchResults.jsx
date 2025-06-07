import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function SearchResults() {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get('q') || '';
  const [notes, setNotes] = useState([]);
  const [fragrances, setFragrances] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);

      const [noteRes, fragRes, brandRes] = await Promise.all([
        supabase.from('notes').select('*').ilike('name', `%${query}%`),
        supabase.from('fragrances').select('*').ilike('name', `%${query}%`),
        supabase.from('brands').select('*').ilike('name', `%${query}%`)
      ]);

      setNotes(noteRes.data || []);
      setFragrances(fragRes.data || []);
      setBrands(brandRes.data || []);
      setLoading(false);
    }

    if (query.trim()) fetchResults();
  }, [query]);

  return (
    <div className="page" style={styles.page}>
      <h1 style={styles.heading}>Search Results for: <span style={{ color: 'var(--accent-color)' }}>{query}</span></h1>
      {loading ? <p>Loading...</p> : (
        <>
          <Section title="Notes" items={notes} renderItem={(n) => (
            <Link to={`/note/${n.id}`} key={n.id} style={styles.resultItem}>
              <img src={n.image_url} alt={n.name} style={styles.image} />
              <div>
                <h3>{n.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#999' }}>{n.accord}</p>
              </div>
            </Link>
          )} />

          <Section title="Fragrances" items={fragrances} renderItem={(f) => (
            <Link to={`/fragrance/${f.id}`} key={f.id} style={styles.resultItem}>
              <img src={f.image_url} alt={f.name} style={styles.image} />
              <div>
                <h3>{f.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#999' }}>{f.brand}</p>
              </div>
            </Link>
          )} />

          <Section title="Brands" items={brands} renderItem={(b) => (
            <Link to={`/brand/${b.id}`} key={b.id} style={styles.resultItem}>
              <img src={b.logo} alt={b.name} style={styles.image} />
              <div>
                <h3>{b.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#999' }}>Founded {b.year}</p>
              </div>
            </Link>
          )} />
        </>
      )}
    </div>
  );
}

function Section({ title, items, renderItem }) {
  if (!items.length) return null;

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.grid}>
        {items.map(renderItem)}
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
    fontSize: '1.75rem',
    marginBottom: '2rem',
    fontWeight: 700,
  },
  section: {
    marginBottom: '2.5rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    color: 'var(--accent-color)',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'var(--surface-color)',
    padding: '1rem',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s ease',
  },
  image: {
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: '8px',
  },
};

export default SearchResults;
