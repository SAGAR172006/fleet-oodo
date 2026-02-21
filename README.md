# FleetFlow

A modular fleet and logistics management web application built with React, Node.js, and Firebase.

## Setup

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
node server.js
```

## Configuration

### Frontend (`src/firebase.js`)
Replace placeholder values with your Firebase project config from Firebase Console → Project Settings → Your Apps.

### Backend (`backend/firebase.js`)
Place your `serviceAccountKey.json` (downloaded from Firebase Console → Project Settings → Service Accounts) in the `backend/` folder. Never commit this file.

### Business Keys (`backend/business-keys.json`)
Add valid business key strings to the `validKeys` array to allow user registration with that key.