import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CollectionDetail() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [fragrances, setFragrances] = useState([]);
  const [allFragrances, setAllFragrances] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchCollection() {
      const { data: collectionData, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error(error);
      else setCollection(collectionData);
    }

    async function fetchCollectionFragrances() {
      const { data, error } = await supabase
        .from('collection_fragrances')
        .select('id, fragrance_id, fragrances(*)')
        .eq('collection_id', id);

      if (error) console.error(error);
      else setFragrances(data || []);
    }

    async function fetchAllFragrances() {
      const { data, error } = await supabase
        .from('fragrances')
        .select('*');

      if (error) console.error(error);
      else setAllFragrances(data);
    }

    fetchCollection();
    fetchCollectionFragrances();
    fetchAllFragrances();
  }, [id]);

  useEffect(() => {
    if (search.length > 0) {
      const filtered = allFragrances.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [search, allFragrances]);

  const addFragranceToCollection = async (fragranceId) => {
    const { data, error } = await supabase
      .from('collection_fragrances')
      .insert({ collection_id: id, fragrance_id: fragranceId })
      .select()
      .single();

    if (error) console.error(error);
    else {
      const fragrance = allFragrances.find(f => f.id === fragranceId);
      if (fragrance) {
        setFragrances(prev => [...prev, { id: data.id, fragrance_id: fragranceId, fragrances: fragrance }]);
      }
      setSearch('');
      setResults([]);
    }
  };

  const removeFragrance = async (collectionFragranceId) => {
    const { error } = await supabase
      .from('collection_fragrances')
      .delete()
      .eq('id', collectionFragranceId);

    if (error) console.error(error);
    else setFragrances(fragrances.filter(f => f.id !== collectionFragranceId));
  };

  return (
    <div className="page">
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
        {collection?.name}
      </h2>

      <input
        type="text"
        placeholder="Search fragrances..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '0.5rem 1rem',
          width: '100%',
          maxWidth: 500,
          marginBottom: '1rem',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-color)',
          color: 'var(--text-primary)',
        }}
      />

      <div style={{ marginBottom: '2rem' }}>
        {results.map(frag => (
          <div
            key={frag.id}
            onClick={() => addFragranceToCollection(frag.id)}
            style={{
              padding: '0.5rem',
              cursor: 'pointer',
              backgroundColor: 'var(--surface-color)',
              borderRadius: 8,
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <img src={frag.image_url} alt={frag.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span>{frag.name}</span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.25rem',
        rowGap: '2rem',
      }}>
        {fragrances.map(entry => (
          <div
            key={entry.id}
            style={{
              backgroundColor: 'var(--surface-color)',
              borderRadius: 12,
              padding: '1rem',
              width: 180,
              position: 'relative',
              textAlign: 'center',
              boxShadow: 'var(--shadow)'
            }}
          >
            <Link to={`/fragrance/${entry.fragrances.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img
                src={entry.fragrances.image_url}
                alt={entry.fragrances.name}
                style={{ width: '100%', height: 140, objectFit: 'contain', marginBottom: '0.75rem' }}
              />
              <h4>{entry.fragrances.name}</h4>
            </Link>
            <button
              onClick={() => removeFragrance(entry.id)}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollectionDetail;
