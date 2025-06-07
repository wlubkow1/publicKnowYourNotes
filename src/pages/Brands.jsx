import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Brands() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    async function fetchBrands() {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching brands:', error);
      } else {
        setBrands(data);
      }
    }

    fetchBrands();
  }, []);

  return (
    <div className="page">
      <h1 style={styles.heading}>Fragrance Brands</h1>
      <div style={styles.grid}>
        {brands.map((brand) => (
          <Link
            key={brand.id}
            to={`/brand/${brand.id}`}
            style={styles.cardLink}
            className="glow-on-hover"
          >
            <div style={styles.card}>
              <img src={brand.logo} alt={brand.name} style={styles.image} />
              <h3 style={styles.name}>{brand.name}</h3>
              <p style={styles.year}>Founded: {brand.year || 'N/A'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  heading: {
    fontSize: '2rem',
    marginBottom: '2rem',
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '2rem',
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  card: {
    backgroundColor: 'var(--surface-color)',
    padding: '1rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: 'var(--shadow)',
  },
  image: {
    width: '100%',
    height: '140px',
    objectFit: 'contain',
    marginBottom: '0.5rem',
  },
  name: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  year: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
  },
};

export default Brands;
