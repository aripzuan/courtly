# Courtly - Court Booking System

A simple and minimalistic court booking application built with React and Firebase.

## Features

- ✅ User authentication (login/signup)
- ✅ Court booking with availability checking
- ✅ User dashboard to view and cancel bookings
- ✅ Simple and clean UI
- ✅ Firebase integration for data storage

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Get your Firebase config and update `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};
```

### 2. Firestore Collections

Create these collections in your Firestore database:

#### Users Collection

- Document ID: `{user_uid}`
- Fields:
  - `email` (string)
  - `role` (string) - default: "user"
  - `created_at` (timestamp)

#### Bookings Collection

- Document ID: auto-generated
- Fields:
  - `court_type` (string) - "badminton", "basketball", "tennis", "futsal"
  - `court_number` (number) - 1, 2, 3, 4
  - `date` (string) - YYYY-MM-DD format
  - `time_start` (string) - HH:MM format
  - `time_end` (string) - HH:MM format
  - `description` (string) - optional
  - `user_id` (string) - Firebase user UID
  - `email` (string) - user email
  - `phone` (string) - optional
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

## How It Works

1. **Landing Page**: Users can view available courts and must login to book
2. **Authentication**: Simple login/signup with Firebase Auth
3. **Booking**: Select date, time, and available court number
4. **Availability Check**: System prevents double bookings for same court/time
5. **Dashboard**: Users can view and cancel their bookings

## Court Types

- Badminton (RM20/hour)
- Basketball (RM100/hour)
- Tennis (RM50/hour)
- Futsal (RM70/hour)

## Time Slots

Available booking times: 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00

## Technologies Used

- React 19
- React Router DOM
- Firebase (Auth + Firestore)
- Vite
- CSS3
