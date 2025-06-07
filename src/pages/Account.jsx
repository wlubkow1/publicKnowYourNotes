import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

function Account() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [collections, setCollections] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      setUser(currentUser);

      if (!currentUser) return navigate('/login');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setDob(profileData.dob || '');
        setBio(profileData.bio || '');
      }

      const { data: userCollections } = await supabase
        .from('collections')
        .select('id, name')
        .eq('profile_id', currentUser.id);

      setCollections(userCollections || []);
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSave = async () => {
    if (!user) return;

    let avatar_url = profile?.avatar_url || null;

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop().toLowerCase();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        avatar_url = data.publicUrl;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ dob, bio, avatar_url })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => ({ ...prev, dob, bio, avatar_url }));
      setEditMode(false);
    }
  };

  const handleAddCollection = async () => {
    if (!newCollectionName.trim()) return;
    const { data, error } = await supabase
      .from('collections')
      .insert({ name: newCollectionName, profile_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setCollections(prev => [...prev, data]);
      setNewCollectionName('');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    await supabase.from('collection_fragrances').delete().eq('collection_id', collectionId);
    await supabase.from('collections').delete().eq('id', collectionId);
    setCollections(prev => prev.filter(col => col.id !== collectionId));
  };

  return (
    <div className="page">
      <div style={styles.container}>
        {/* Left: Profile */}
        <div style={styles.left}>
          <div style={styles.card}>
            <img
              src={profile?.avatar_url || 'https://via.placeholder.com/100'}
              alt="Avatar"
              style={styles.avatar}
            />
            <h2>{profile?.full_name}</h2>
            <p style={styles.username}>@{profile?.username}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Date of Birth:</strong> {profile?.dob || 'Not set'}</p>
            <p><strong>Bio:</strong> {profile?.bio || 'No bio yet.'}</p>
            <div style={styles.buttonRow}>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
              <button onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>

        {/* Right: Collections */}
        <div style={styles.right}>
          <div style={styles.card}>
            <h3 style={{ marginBottom: '1rem' }}>Your Collections</h3>
            <div style={styles.addRow}>
              <input
                type="text"
                placeholder="New collection title"
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                style={styles.input}
              />
              <button onClick={handleAddCollection}>Add</button>
            </div>
            <div style={styles.collectionGrid}>
              {collections.map((col) => (
                <div key={col.id} style={styles.collectionBox}>
                  <Link to={`/collection/${col.id}`} style={styles.collectionLink}>
                    <h4 style={styles.collectionName}>{col.name}</h4>
                  </Link>
                  <button
                    onClick={() => handleDeleteCollection(col.id)}
                    style={styles.deleteBtn}
                    title="Delete Collection"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {editMode && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button style={styles.close} onClick={() => setEditMode(false)}>✕</button>
            <h3>Edit Profile</h3>
            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="Date of Birth"
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your bio..."
              rows={4}
              style={{ resize: 'none' }}
            />
            <button onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2rem',
    alignItems: 'flex-start',
  },
  left: { flex: 1 },
  right: { flex: 2 },
  card: {
    backgroundColor: 'var(--surface-color)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow)',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 'var(--radius-md)',
    objectFit: 'cover',
    marginBottom: '1rem',
  },
  username: {
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  buttonRow: {
    marginTop: '1rem',
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #444',
    background: 'var(--surface-color)',
    color: 'var(--text-primary)',
  },
  addRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  collectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  collectionBox: {
    backgroundColor: '#1a1a1a',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectionLink: {
    textDecoration: 'none',
    color: '#aad0ff',
    fontWeight: 600,
    flex: 1,
  },
  collectionName: {
    margin: 0,
  },
  deleteBtn: {
    background: 'transparent',
    color: '#aaa',
    border: 'none',
    fontSize: '1.1rem',
    cursor: 'pointer',
    marginLeft: '0.75rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modal: {
    backgroundColor: 'var(--surface-color)',
    padding: '2rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow)',
    width: '100%',
    maxWidth: '400px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 12,
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    border: 'none',
  },
};
