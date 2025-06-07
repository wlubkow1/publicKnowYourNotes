import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Notes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching notes:', error);
      } else {
        setNotes(data);
      }
    }

    fetchNotes();
  }, []);

  return (
    <div className="page">
      <h1 style={styles.heading}>Fragrance Notes</h1>
      <div style={styles.grid}>
        {notes.map(note => (
          <Link
            to={`/note/${note.id}`}
            key={note.id}
            style={styles.cardLink}
            className="glow-on-hover"
          >
            <div style={styles.card}>
              <img src={note.image_url} alt={note.name} style={styles.image} />
              <h3 style={styles.name}>{note.name}</h3>
              <p style={styles.description}>{note.description}</p>
              <span style={{ 
                ...styles.accordLabel, 
                backgroundColor: note.hex || '#888' 
              }}>
                {note.accord}
              </span>
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
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.25rem',
    rowGap: '3rem',
    justifyContent: 'center',
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
    flex: '1 1 250px',
    maxWidth: '280px',
    display: 'flex',
  },
  card: {
    backgroundColor: 'var(--surface-color)',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  image: {
    width: '100%',
    height: '160px',
    objectFit: 'contain',
    borderRadius: '8px',
    marginBottom: '0.75rem',
  },
  name: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0.5rem 0 0.25rem',
  },
  description: {
    fontSize: '0.95rem',
    opacity: 0.85,
    lineHeight: 1.4,
    marginBottom: '0.5rem',
  },
  accordLabel: {
    alignSelf: 'center',
    color: '#000',
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    borderRadius: '999px',
    marginTop: 'auto',
    backgroundColor: '#999',
  }
};

export default Notes;
