# Know Your Notes

**Know Your Notes** is a fragrance-focused web application that helps users explore, discover, and curate perfumes and colognes based on their favorite scent notes, accords, and brands. Built with **React** and powered by **Supabase**, the platform offers a modern, dark-themed experience similar to Fragrantica but with a fresh take on user interactivity and personalization.

## 🌟 Features

### 🔍 Live Search
- Search bar with real-time results for fragrances, notes, and brands
- Click results to navigate directly to detail pages
- Press Enter to view a full search results page

### 🧪 Notes Explorer
- Browse all scent notes in a grid layout
- Each note shows an image, description, and color-coded accord
- Click a note to see all fragrances containing it

### 🌿 Note Detail Page
- Displays the note name, image, accord type, and description
- Shows a horizontal card layout of all associated fragrances
- Each fragrance card links to its detail page

### 🧴 Fragrance Detail Page
- Displays fragrance name, image, brand, year, and full info
- Sections for top, heart, and base notes with clickable links to Note pages
- Bar chart of accord distribution (styled like Fragrantica)
- Option to add fragrance to a personal collection via a "+" modal popup
- Toast-style confirmation message appears upon adding

### 🧠 Brand Pages
- View all brands in an alphabetical list
- Brand detail page includes logo, description, and fragrance list

### 👤 User Authentication
- Signup, login, and secure session management via Supabase Auth
- Users create a profile (name, username, email, DOB, bio, avatar)
- Profile is editable directly from the account page

### 📁 User Collections
- Users can create named collections of fragrances
- Add or remove fragrances from collections
- View fragrances in each collection using the Explore card style
- Delete collections and automatically remove associated data
- Add fragrances to collections directly from their detail page

### 🎨 Design & Styling
- Fully responsive dark-themed interface
- Clean, modern UI using Tailwind CSS and component libraries
- Interactive elements like modals, hover effects, and popups enhance usability

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Charting:** Recharts for visual accord distribution
- **Routing:** React Router DOM
- **State Management:** useState, useEffect, custom hooks

---

## 🗂️ Folder Structure

