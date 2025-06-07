import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';

function Navbar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      const [noteRes, fragRes, brandRes] = await Promise.all([
        supabase.from('notes').select('*').ilike('name', `%${query}%`),
        supabase.from('fragrances').select('*').ilike('name', `%${query}%`),
        supabase.from('brands').select('*').ilike('name', `%${query}%`)
      ]);

      const notes = (noteRes.data || []).map(n => ({ type: 'note', id: n.id, label: `Note: ${n.name}` }));
      const frags = (fragRes.data || []).map(f => ({ type: 'fragrance', id: f.id, label: `Fragrance: ${f.name}` }));
      const brands = (brandRes.data || []).map(b => ({ type: 'brand', id: b.id, label: `Brand: ${b.name}` }));

      setResults([...notes, ...frags, ...brands]);
    };

    search();
  }, [query]);

  const handleSelect = (result) => {
    if (result.type === 'note') navigate(`/note/${result.id}`);
    if (result.type === 'fragrance') navigate(`/fragrance/${result.id}`);
    if (result.type === 'brand') navigate(`/brand/${result.id}`);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      navigate(`/search?q=${query}`);
      setShowDropdown(false);
    }
  };

  const navItems = [
    { label: 'Notes', path: '/notes' },
    { label: 'Brands', path: '/brands' },
    { label: 'Explore', path: '/explore' },
    { label: 'Upcoming', path: '/upcoming' },
    { label: 'My Account', path: '/account' },
  ];

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.logoContainer}>
        <Link to="/" style={styles.logoLink}>
          <span style={{ opacity: 0.9 }}>know</span>
          <span style={{ opacity: 0.9 }}>your</span>
          <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>notes</span>
        </Link>
      </div>

      {/* Search */}
      <div ref={wrapperRef} style={styles.searchWrapper}>
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleEnter}
          placeholder="Search..."
          style={styles.search}
        />
        {showDropdown && results.length > 0 && (
          <div style={styles.dropdown}>
            {results.map((r, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(r)}
                style={styles.dropdownItem}
              >
                {r.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu */}
      <div style={styles.menu}>
        {navItems.map(item => (
          <Link key={item.label} to={item.path} style={styles.link} className="nav-link">
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: 'var(--surface-color)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    gap: '1rem',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    lineHeight: '1.1',
  },
  logoLink: {
    color: 'inherit',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 300px',
    maxWidth: '100%',
  },
  search: {
    width: '100%',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '6px',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid #30363d',
    color: 'var(--text-color)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 0.4rem)',
    left: 0,
    right: 0,
    backgroundColor: '#0d1117',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
    zIndex: 1000,
    maxHeight: '300px',
    overflowY: 'auto',
  },
  dropdownItem: {
    padding: '0.6rem 1rem',
    borderBottom: '1px solid #222',
    cursor: 'pointer',
    color: 'var(--text-color)',
    transition: 'background 0.2s',
  },
  menu: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  link: {
    color: 'var(--text-color)',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
};

export default Navbar;
