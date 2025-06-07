import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function BrandDetail() {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [fragrances, setFragrances] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();

      if (brandError) {
        console.error('Error fetching brand:', brandError);
        return;
      }
      setBrand(brandData);

      const { data: frags, error: fragError } = await supabase
        .from('fragrances')
        .select('*')
        .eq('brand', brandData.name);

      if (fragError) {
        console.error('Error fetching fragrances:', fragError);
        return;
      }

      setFragrances(frags);
    }

    fetchData();
  }, [id]);

  if (!brand) return <div className="page">Loading brand info...</div>;

  return (
    <div className="page">
      {/* Brand Info Section */}
      <div style={styles.brandSection}>
        <div style={styles.logoWrapper}>
          <img src={brand.logo} alt={brand.name} style={styles.logo} />
        </div>
        <div style={styles.meta}>
          <h1 style={styles.title}>{brand.name}</h1>
          <p style={styles.year}>Founded: {brand.year || 'Unknown'}</p>
        </div>
      </div>

      <p style={styles.description}>{brand.description}</p>

      {/* Fragrance Grid */}
      <h2 style={styles.subtitle}>Fragrances by {brand.name}</h2>
      <div style={styles.grid}>
        {fragrances.map(f => (
          <Link key={f.id} to={`/fragrance/${f.id}`} style={styles.cardLink}>
            <div style={styles.card}>
              <img src={f.image_url} alt={f.name} style={styles.fragImage} />
              <h3 style={styles.fragName}>{f.name}</h3>
              <p style={styles.metaText}>Released: {f.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  brandSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  logoWrapper: {
    flexShrink: 0,
    maxWidth: '180px',
  },
  logo: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
  },
  meta: {
    flexGrow: 1,
    minWidth: '200px',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.25rem',
  },
  year: {
    fontSize: '1rem',
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
  },
  description: {
    fontSize: '1rem',
    opacity: 0.85,
    lineHeight: 1.6,
    marginTop: '1rem',
    marginBottom: '2.5rem',
    maxWidth: '100%',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: 'var(--accent-color)',
    marginBottom: '1rem',
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
    boxShadow: 'var(--shadow)',
    textAlign: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  fragImage: {
    width: '100%',
    height: '150px',
    objectFit: 'contain',
    marginBottom: '0.75rem',
    borderRadius: '8px',
  },
  fragName: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  metaText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
};

export default BrandDetail;
