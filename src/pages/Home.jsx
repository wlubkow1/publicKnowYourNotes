import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Home() {
  const [topRated, setTopRated] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [mostPopular, setMostPopular] = useState([]);
  const [accordMap, setAccordMap] = useState({});

  useEffect(() => {
    async function fetchData() {
      const { data: rated } = await supabase
        .from('fragrances')
        .select('*')
        .order('rating', { ascending: false })
        .limit(10);

      const { data: allFrags } = await supabase
        .from('fragrances')
        .select('*');

      const { data: popular } = await supabase
        .from('fragrances')
        .select('*')
        .order('sales', { ascending: false })
        .limit(10);

      const { data: fragranceNotes } = await supabase
        .from('fragrance_notes')
        .select(`
          fragrance_id,
          notes (
            accord,
            hex
          )
        `);

      const grouped = {};
      for (const row of fragranceNotes) {
        const id = row.fragrance_id;
        if (!grouped[id]) grouped[id] = [];

        const { accord, hex } = row.notes;
        if (accord && !grouped[id].some(n => n.accord === accord)) {
          grouped[id].push({ accord, hex });
        }
      }

      setTopRated(rated);
      setFeatured(shuffleArray(allFrags).slice(0, 10));
      setMostPopular(popular);
      setAccordMap(grouped);
    }

    fetchData();
  }, []);

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const getRatingColor = (rating) => {
    if (rating >= 9) return '#00C853'; // bright green
    if (rating >= 7) return '#2DFF77'; // green
    if (rating >= 5) return '#FFEB3B'; // yellow
    if (rating >= 3) return '#FFA726'; // orange
    return '#EF5350'; // red
  };

  const renderRatingMeter = (rating = 0) => {
    const value = Math.min(rating, 10);
    const percentage = (value / 10) * 100;
    return (
      <div style={{ marginTop: '0.5rem' }}>
        <div style={styles.ratingLabel}>Rating: {value.toFixed(1)} / 10</div>
        <div style={styles.ratingBarContainer}>
          <div
            style={{
              ...styles.ratingBarFill,
              width: `${percentage}%`,
              backgroundColor: getRatingColor(value),
            }}
          />
        </div>
      </div>
    );
  };

  const renderAccords = (fragranceId) => {
    const accords = accordMap[fragranceId] || [];
    return (
      <div style={styles.accordContainer}>
        {accords.map((a, i) => (
          <span
            key={i}
            style={{
              ...styles.accordTag,
              backgroundColor: a.hex,
            }}
          >
            {a.accord}
          </span>
        ))}
      </div>
    );
  };

  const renderFragranceCard = (fragrance, index = null, showMeta = true, showAccords = false) => (
    <Link to={`/fragrance/${fragrance.id}`} key={fragrance.id} style={styles.link}>
      <div style={styles.fragCard}>
        {index !== null && <div style={styles.indexNumber}>{index + 1}.</div>}
        <img src={fragrance.image_url} alt={fragrance.name} style={styles.fragImage} />
        <h3 style={styles.fragName}>{fragrance.name}</h3>
        <p style={styles.meta}>Brand: {fragrance.brand}</p>
        {showMeta && (
          <>
            <p style={styles.meta}>Price: ${fragrance.cost}</p>
            {renderRatingMeter(fragrance.rating)}
          </>
        )}
        {showAccords && renderAccords(fragrance.id)}
      </div>
    </Link>
  );

  return (
    <div className="page">
      <div style={styles.columns}>
        <div style={styles.column}>
          <h2 style={styles.sectionTitle}>Top Rated</h2>
          {topRated.map((f, idx) => renderFragranceCard(f, idx, true))}
        </div>
        <div style={styles.column}>
          <h2 style={styles.sectionTitle}>Featured</h2>
          {featured.map(f => renderFragranceCard(f, null, false, true))}
        </div>
        <div style={styles.column}>
          <h2 style={styles.sectionTitle}>Most Popular</h2>
          {mostPopular.map((f, idx) => renderFragranceCard(f, idx, true))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  heading: {
    fontSize: '2rem',
    marginBottom: '2rem',
    fontWeight: 700,
    textAlign: 'center',
  },
  columns: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'space-between',
  },
  column: {
    flex: '1 1 300px',
    minWidth: '280px',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    color: 'var(--accent-color)',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  fragCard: {
    backgroundColor: 'var(--surface-color)',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    textAlign: 'center',
    marginBottom: '1.5rem',
    transition: 'var(--transition)',
    position: 'relative',
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
    fontWeight: 'bold',
    margin: '0.5rem 0',
    color: 'var(--text-color)',
  },
  meta: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: '0.25rem 0',
  },
  ratingLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.25rem',
  },
  ratingBarContainer: {
    height: '8px',
    backgroundColor: '#2e2e2e',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
  },
  indexNumber: {
    position: 'absolute',
    top: '0.5rem',
    left: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'var(--accent-color)',
  },
  accordContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '0.5rem',
    gap: '0.5rem',
  },
  accordTag: {
    padding: '0.25rem 0.6rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: '#000',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
};

export default Home;
