import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import badmintonImg from '../assets/badminton.jpg';
import basketballImg from '../assets/basketball.jpg';
import futsalImg from '../assets/futsal.jpg';
import tennisImg from '../assets/tennis.jpg';

const courtImages = {
  badminton: badmintonImg,
  basketball: basketballImg,
  futsal: futsalImg,
  tennis: tennisImg,
};

const LandingPage = ({ user }) => {
  const [courts, setCourts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(import.meta.env.VITE_COURTS_API_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourts(data);
        else {
          setCourts([]);
          setError('Failed to load courts.');
        }
      })
      .catch(() => {
        setCourts([]);
        setError('Failed to load courts.');
      });
  }, []);

  // Group courts by type for display
  const courtsByType = Array.isArray(courts) ? courts.reduce((acc, court) => {
    if (!acc[court.court_type]) acc[court.court_type] = [];
    acc[court.court_type].push(court);
    return acc;
  }, {}) : {};

  return (
    <div className="landing">
      <div className="hero">
        <h1>Welcome to Courtly</h1>
        <p>Book your favorite sports courts with ease</p>
        {!user && (
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        )}
      </div>

      <div className="container">
        <h2>Available Courts</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="courts-grid">
          {Object.entries(courtsByType).map(([type, courtsArr]) => (
            <div key={type} className="court-card">
              <div className="court-image-wrap">
                <img src={courtImages[type]} alt={type + ' court'} className="court-image" />
              </div>
              <h3>{courtsArr[0]?.court_type ? courtsArr[0].court_type.charAt(0).toUpperCase() + courtsArr[0].court_type.slice(1) : ''}</h3>
              <p className="court-price">RM{courtsArr[0]?.price_per_hour}/hour</p>
              <p className="court-count">{courtsArr.length} Courts</p>
              {user ? (
                <Link to={`/booking/${type}`} className="btn btn-primary">
                  Book Now
                </Link>
              ) : (
                <Link to="/login" className="btn btn-secondary">
                  Login to Book
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 