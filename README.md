# 🎬 Movie & TV Tracker App

A fully responsive movie and TV tracking app built with **React** and **Chakra UI**, allowing users to browse, watch, and manage their watchlists and viewing history. Integrates with **Firebase** for user authentication and data storage, and fetches real-time media info from external APIs like **TMDb**, **IMDb**, and **Vidsrc**.

---

## 🔧 Features

- 🔐 **Authentication** with Google (via Firebase)
- 📺 **Browse Movies/TV Shows** using external APIs
- 📌 **Watchlist & Watched Films** management (Firestore persistence)
- 🔎 **Genre/Type/Runtime filters**
- 📅 **Season & Episode navigation**
- 🎥 **Embed trailers & episodes** with working iframe player
- 🌙 Fully responsive **UI with Chakra UI** and custom styling
- ⚙️ **Experimental Mode** toggle with user-specific Firestore storage

---

## 📷 Screenshots

*(You can insert GIFs or screenshots here)*

---

## 🧰 Tech Stack

- **React.js** (Frontend)
- **Chakra UI** (Component library)
- **Firebase**:
  - Authentication
  - Firestore Database
- **React Select** (Dropdowns)
- **TMDb / IMDb / Vidsrc API** (Movie/TV data)
- **React Router** (Page routing)

---

## 🔐 Firebase Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;

      match /watchlist/{detailsId} {
        allow read, write: if request.auth.uid == userId;
      }

      match /watchedfilms/{detailsId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/movie-tv-tracker.git
cd movie-tv-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add Firebase config

Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
...
```

### 4. Run the app

```bash
npm run dev
```

---

## 📁 Folder Structure

```
src/
├── components/         # Reusable UI components
├── pages/              # Route-level components
├── services/           # API & Firebase logic
├── context/            # Auth and app-level context
├── utils/              # Helper functions
├── App.jsx             # Main app structure
└── main.jsx            # Entry point
```

---

## 📝 To-Do

- [ ] Add user profile photo and name editing
- [ ] Paginate long watchlists
- [ ] Rate and review films
- [ ] Optimize loading performance
- [ ] Add light/dark mode toggle

---

## 💡 Credits

- [Chakra UI](https://chakra-ui.com/)
- [Firebase](https://firebase.google.com/)
- [TMDb API](https://www.themoviedb.org/documentation/api)
- [Vidsrc](https://vidsrc.to/)
- [React Select](https://react-select.com/home)

---

## 🛡 License

MIT © 2025 Abhishek Luthra
