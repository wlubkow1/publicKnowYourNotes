import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [fragrances, setFragrances] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (noteError) {
        console.error('Error fetching note:', noteError);
        return;
      }
      setNote(noteData);

      const { data: fragranceNotes, error: fnError } = await supabase
        .from('fragrance_notes')
        .select('fragrances (*)')
        .eq('note_id', id);

      if (fnError) {
        console.error('Error fetching fragrances:', fnError);
        return;
      }

      const frags = fragranceNotes.map(f => f.fragrances);
      setFragrances(frags);
    }

    fetchData();
  }, [id]);

  if (!note) return <div className="page">Loading note details...</div>;

  return (
    <div className="page">
      <h1 style={styles.title}>{note.name}</h1>
      <img src={note.image_url} alt={note.name} style={styles.image} />
      
      <span style={{
        ...styles.accord,
        backgroundColor: note.hex || '#888',
      }}>
        {note.accord}
      </span>

      <p style={styles.description}>{note.description}</p>

      <h2 style={styles.subtitle}>Fragrances with this note</h2>
      <div style={styles.fragList}>
        {fragrances.map(frag => (
          <Link key={frag.id} to={`/fragrance/${frag.id}`} style={styles.card}>
            <img src={frag.image_url} alt={frag.name} style={styles.fragImage} />
            <div>
              <h3 style={styles.fragName}>{frag.name}</h3>
              <p style={styles.fragMeta}>
                {frag.brand} • {frag.year}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  image: {
    width: 200,
    height: 200,
    objectFit: 'contain',
    borderRadius: '50%',
    marginBottom: '1rem',
  },
  accord: {
    display: 'inline-block',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '999px',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1rem',
    opacity: 0.85,
    maxWidth: 600,
    marginBottom: '2rem',
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    marginTop: '2rem',
  },
  fragList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--surface-color)',
    padding: '1rem',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s ease',
  },
  fragImage: {
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: '8px',
    marginRight: '1rem',
  },
  fragName: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--accent-color)',
    marginBottom: '0.25rem',
  },
  fragMeta: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
  },
};

export default NoteDetail;
