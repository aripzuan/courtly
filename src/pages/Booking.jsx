import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import badmintonImg from '../assets/badminton.jpg';
import basketballImg from '../assets/basketball.jpg';
import futsalImg from '../assets/futsal.jpg';
import tennisImg from '../assets/tennis.jpg';
import { useAuth } from '../store'; // or wherever your auth context/hook is

const courtImages = {
  badminton: badmintonImg,
  basketball: basketballImg,
  futsal: futsalImg,
  tennis: tennisImg,
};

const Booking = () => {
  const { courtType } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // get user from context/hook
  const { isDarkMode } = useTheme();
  
  const [courts, setCourts] = useState([]);
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [courtNumber, setCourtNumber] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

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

  // Filter courts for this type
  const courtsForType = courts.filter(c => c.court_type === courtType);
  const courtNumbers = courtsForType.map(c => c.court_number);
  const pricePerHour = courtsForType[0]?.price_per_hour || 0;

  const courtNames = {
    badminton: 'Badminton',
    basketball: 'Basketball',
    tennis: 'Tennis',
    futsal: 'Futsal'
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    if (date && timeStart && timeEnd && isValidDuration()) {
      // checkAvailability();
      // No setAvailableCourts since availableCourts is not used
    }
    // No setAvailableCourts([]) since availableCourts is not used
  }, [date, timeStart, timeEnd, courts]);

  const isValidDuration = () => {
    if (!timeStart || !timeEnd) return false;
    const startHour = parseInt(timeStart.split(':')[0]);
    const endHour = parseInt(timeEnd.split(':')[0]);
    return endHour > startHour;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!courtNumber) {
      setError('Please select a court number');
      setLoading(false);
      return;
    }
    if (!isValidDuration()) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    // POST booking to API
    try {
      const res = await fetch('https://7d6a1fd2-a733-4530-9a29-9744334481ce-00-341w6ruqr3jxg.pike.replit.dev/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          court_type: courtType,
          court_number: parseInt(courtNumber),
          date,
          time_start: timeStart,
          time_end: timeEnd,
          description
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Booking failed');
        setLoading(false);
        return;
      }
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError('Booking failed: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const calculateTotalPrice = () => {
    if (!timeStart || !timeEnd) return 0;
    const startHour = parseInt(timeStart.split(':')[0]);
    const endHour = parseInt(timeEnd.split(':')[0]);
    const hours = endHour - startHour;
    if (hours <= 0) return 0;
    return hours * pricePerHour;
  };

  const totalPrice = calculateTotalPrice();

  // Only show end times after the selected start time
  const filteredEndTimes = timeStart
    ? timeSlots.filter(time => parseInt(time.split(':')[0]) > parseInt(timeStart.split(':')[0]))
    : timeSlots;

  return (
    <div className={`booking-page-bg${isDarkMode ? ' bg-dark text-white' : ''}`}>
      <div className={`booking-card-wide${isDarkMode ? ' bg-dark text-white border-secondary' : ''}`} style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}>
        <div className="booking-sport-image-wide-wrap">
          <img
            src={courtImages[courtType]}
            alt={courtType + ' court'}
            className="booking-sport-image-wide"
            onClick={() => setShowImageModal(true)}
            style={{ cursor: 'zoom-in' }}
          />
        </div>
        {showImageModal && (
          <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
            <div className="image-modal-content" onClick={e => e.stopPropagation()}>
              <button className="image-modal-close" onClick={() => setShowImageModal(false)}>&times;</button>
              <img src={courtImages[courtType]} alt={courtType + ' court enlarged'} className="image-modal-img" />
            </div>
          </div>
        )}
        <h2 className="booking-heading-wide">Book {courtNames[courtType]} Court</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="booking-form-wide">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getMinDate()}
              required
              className={`form-control${isDarkMode ? ' bg-dark text-white border-secondary' : ''}`}
            />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <select value={timeStart} onChange={(e) => setTimeStart(e.target.value)} required className={`form-control${isDarkMode ? ' bg-dark text-white border-secondary' : ''}`}>
              <option value="">Select time</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>End Time</label>
            <select value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} required className={`form-control${isDarkMode ? ' bg-dark text-white border-secondary' : ''}`}>
              <option value="">Select time</option>
              {filteredEndTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          {date && timeStart && timeEnd && !isValidDuration() && (
            <div className="error-message">End time must be after start time.</div>
          )}
          {date && timeStart && timeEnd && isValidDuration() && (
            <div className="form-group">
              <label>Available Courts</label>
              {courtNumbers.length > 0 ? (
                <select value={courtNumber} onChange={(e) => setCourtNumber(e.target.value)} required className={`form-control${isDarkMode ? ' bg-dark text-white border-secondary' : ''}`}>
                  <option value="">Select court</option>
                  {courtNumbers.map(num => (
                    <option key={num} value={num}>Court {num}</option>
                  ))}
                </select>
              ) : (
                <p className="no-availability">No courts available for this time slot</p>
              )}
            </div>
          )}
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`form-control${isDarkMode ? ' bg-dark text-white border-secondary' : ''}`}
              placeholder="Any special requests or notes..."
            />
          </div>
          {totalPrice > 0 && isValidDuration() && (
            <div className={`price-summary mt-4${isDarkMode ? ' bg-dark-subtle text-white border-secondary' : ''}`} style={{ border: '1px solid #dee2e6' }}>
              <h3>Booking Summary</h3>
              <div className="price-details">
                <p><span>Court Type:</span> <span>{courtNames[courtType]}</span></p>
                <p><span>Duration:</span> <span>{timeStart} - {timeEnd}</span></p>
                <p><span>Hours:</span> <span>{isValidDuration() ? parseInt(timeEnd.split(':')[0]) - parseInt(timeStart.split(':')[0]) : 0}</span></p>
                <p><span>Price per Hour:</span> <span>RM{pricePerHour}</span></p>
              </div>
              <div className="total-price" style={{ color: '#27ae60' }}>
                <span>Total Price:</span> <span>RM{totalPrice}</span>
              </div>
            </div>
          )}
          <div className="form-buttons">
            <button type="submit" className="btn btn-primary" disabled={loading || courtNumbers.length === 0 || !isValidDuration()}>
              {loading ? 'Creating booking...' : `Book Court - RM${totalPrice}`}
            </button>
            <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking; 