import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

function FragranceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fragrance, setFragrance] = useState(null);
  const [notesByLayer, setNotesByLayer] = useState({ top: [], heart: [], base: [] });
  const [accordData, setAccordData] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data: fragData, error: fragError } = await supabase
        .from('fragrances')
        .select('*')
        .eq('id', id)
        .single();

      if (fragError) return console.error(fragError);
      setFragrance(fragData);

      const { data: noteLinks } = await supabase
        .from('fragrance_notes')
        .select(`
          layer,
          notes (
            id,
            name,
            description,
            image_url,
            accord,
            hex
          )
        `)
        .eq('fragrance_id', id);

      const grouped = { top: [], heart: [], base: [] };
      const accordCount = {};

      for (const link of noteLinks) {
        const note = link.notes;
        if (grouped[link.layer]) grouped[link.layer].push(note);
        if (note.accord) {
          accordCount[note.accord] = accordCount[note.accord] || { count: 0, color: note.hex || '#ccc' };
          accordCount[note.accord].count += 1;
        }
      }

      setNotesByLayer(grouped);
      const dataForChart = Object.entries(accordCount).map(([accord, { count, color }]) => ({
        accord, count, color
      })).sort((a, b) => b.count - a.count);

      setAccordData(dataForChart);
    }

    async function fetchCollections() {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('profile_id', userId);

      setCollections(data || []);
    }

    fetchData();
    fetchCollections();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddToCollection = async () => {
    let collectionId = selectedCollection;

    if (!collectionId && newCollectionName.trim()) {
      const { data: newCol } = await supabase
        .from('collections')
        .insert({ name: newCollectionName.trim(), profile_id: (await supabase.auth.getSession()).data.session.user.id })
        .select()
        .single();

      if (newCol) {
        collectionId = newCol.id;
        setCollections(prev => [...prev, newCol]);
      }
    }

    if (collectionId) {
      const { error } = await supabase
        .from('collection_fragrances')
        .insert({ collection_id: collectionId, fragrance_id: id });

      if (!error) {
        showToast('Fragrance added to collection!');
        setModalOpen(false);
        setSelectedCollection('');
        setNewCollectionName('');
      }
    }
  };

  if (!fragrance) return <p style={{ padding: '2rem' }}>Loading fragrance...</p>;

  return (
    <div className="page" style={styles.page}>
      <div style={styles.header}>
        <div style={styles.info}>
          <h1 style={styles.title}>
            {fragrance.name}
            <button onClick={() => setModalOpen(true)} style={styles.plusButton}>＋</button>
          </h1>
          <p><strong>Brand:</strong> {fragrance.brand}</p>
          <p><strong>Release Year:</strong> {fragrance.year || 'N/A'}</p>
          <p><strong>Gender:</strong> {fragrance.gender}</p>
          <p><strong>Cost:</strong> ${fragrance.cost || 0}</p>
          <p><strong>Rating:</strong> {fragrance.rating?.toFixed(1) || '0.0'} / 10</p>
          <p style={styles.description}>{fragrance.description}</p>
        </div>
        <div style={styles.imageContainer}>
          <img src={fragrance.image_url} alt={fragrance.name} style={styles.fragImage} />
        </div>
      </div>

      {accordData.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={styles.sectionTitle}>Accord Breakdown</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart layout="vertical" data={accordData}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="accord" tick={{ fill: 'var(--text-color)', fontSize: 14 }} width={100} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                {accordData.map((entry, i) => (
                  <Cell key={i} fill={entry.color || '#888'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {['top', 'heart', 'base'].map(layer => (
        <div key={layer} style={{ marginTop: '2rem' }}>
          <h2 style={styles.sectionTitle}>
            {layer.charAt(0).toUpperCase() + layer.slice(1)} Notes
          </h2>
          <div style={styles.noteGrid}>
            {notesByLayer[layer].map(note => (
              <div key={note.id} className="glow-on-hover" onClick={() => navigate(`/note/${note.id}`)} style={styles.noteCard}>
                <img src={note.image_url} alt={note.name} style={styles.noteImage} />
                <h3 style={styles.noteName}>{note.name}</h3>
                <p style={styles.noteDesc}>{note.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button onClick={() => setModalOpen(false)} style={styles.modalClose}>×</button>
            <h3>Add to Collection</h3>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              style={styles.select}
            >
              <option value="">Select a collection</option>
              {collections.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or create new collection..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleAddToCollection} style={styles.addBtn}>Add to Collection</button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={styles.toast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '2rem', color: 'var(--text-color)' },
  header: { display: 'flex', flexWrap: 'wrap', gap: '2rem' },
  info: { flex: '1 1 500px' },
  title: { fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  plusButton: {
    background: 'var(--accent-color)',
    color: '#fff',
    border: 'none',
    fontSize: '1.25rem',
    borderRadius: '50%',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    lineHeight: '32px',
    textAlign: 'center'
  },
  description: { marginTop: '1rem', opacity: 0.85 },
  imageContainer: { maxWidth: '420px' },
  fragImage: {
    width: '100%', maxWidth: '400px', borderRadius: '12px',
    objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  sectionTitle: { fontSize: '1.5rem', color: 'var(--accent-color)', marginBottom: '1rem' },
  noteGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' },
  noteCard: {
    backgroundColor: 'var(--surface-color)', padding: '1rem', borderRadius: '12px',
    textAlign: 'center', cursor: 'pointer'
  },
  noteImage: { width: '100%', height: '160px', objectFit: 'contain', borderRadius: '8px', marginBottom: '0.75rem' },
  noteName: { fontSize: '1.1rem', fontWeight: 600 },
  noteDesc: { fontSize: '0.9rem', opacity: 0.85 },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 20
  },
  modal: {
    backgroundColor: 'var(--surface-color)', padding: '2rem', borderRadius: '12px',
    width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative'
  },
  modalClose: {
    position: 'absolute', top: 10, right: 10, border: 'none',
    background: 'transparent', color: '#ccc', fontSize: '1.4rem', cursor: 'pointer'
  },
  input: {
    padding: '0.5rem', borderRadius: '8px', border: '1px solid #444',
    backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)'
  },
  select: {
    padding: '0.5rem', borderRadius: '8px', border: '1px solid #444',
    backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)'
  },
  addBtn: {
    padding: '0.5rem', backgroundColor: 'var(--accent-color)',
    color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer'
  },
  toast: {
    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
    backgroundColor: '#333', color: '#fff', padding: '0.75rem 1.5rem',
    borderRadius: '999px', fontSize: '0.95rem', zIndex: 30
  }
};

export default FragranceDetail;
