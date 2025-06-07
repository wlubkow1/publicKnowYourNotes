import Navbar from './navbar';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Notes from './pages/Notes';
import Brands from './pages/Brands';
import Explore from './pages/Explore';
import Upcoming from './pages/Upcoming';
import Account from './pages/Account';
import FragranceDetail from './pages/FragranceDetail';
import NoteDetail from './pages/NoteDetail';
import BrandDetail from './pages/BrandDetail';
import SearchResults from './pages/SearchResults';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CollectionDetail from './pages/CollectionDetail';



function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/account" element={<Account />} />
        <Route path="/fragrance/:id" element={<FragranceDetail />} />
        <Route path="/note/:id" element={<NoteDetail />} />
        <Route path="/brand/:id" element={<BrandDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/collection/:id" element={<CollectionDetail />}/>

      </Routes>
    </>
  );
}

export default App;
