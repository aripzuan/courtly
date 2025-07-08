import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
// import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
// import { db } from '../firebase';

const Dashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`https://7d6a1fd2-a733-4530-9a29-9744334481ce-00-341w6ruqr3jxg.pike.replit.dev/api/bookings?user_id=${user.uid}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await fetch(`https://7d6a1fd2-a733-4530-9a29-9744334481ce-00-341w6ruqr3jxg.pike.replit.dev/api/bookings/${bookingId}`, {
          method: 'DELETE'
        });
        fetchBookings(); // Refresh the list
      } catch (error) {
        console.error('Error canceling booking:', error);
      }
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setUpdateError('');
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError('');

    try {
      const updatedData = {
        date: editingBooking.date,
        time_start: editingBooking.time_start,
        time_end: editingBooking.time_end,
        description: editingBooking.description,
      };
      const res = await fetch(`https://7d6a1fd2-a733-4530-9a29-9744334481ce-00-341w6ruqr3jxg.pike.replit.dev/api/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (!res.ok) {
        setUpdateError(data.error || 'Failed to update booking.');
        setUpdateLoading(false);
        return;
      }
      setEditingBooking(null);
      fetchBookings(); // Refresh the list
    } catch (error) {
      setUpdateError('Failed to update booking. Please try again.');
      console.error('Error updating booking:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setUpdateError('');
  };

  const formatDate = (date) => {
    // Handles both Date objects and string (YYYY-MM-DD)
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    return time;
  };

  const calculateBookingPrice = (booking) => {
    const courtPrices = {
      badminton: 20,
      basketball: 100,
      tennis: 50,
      futsal: 70
    };
    
    const startHour = parseInt(booking.time_start.split(':')[0]);
    const endHour = parseInt(booking.time_end.split(':')[0]);
    const hours = endHour - startHour;
    if (hours <= 0) return 0;
    return hours * courtPrices[booking.court_type];
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Helper to format date for input type='date'
  function toDateInputValue(date) {
    if (!date) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + month + '-' + day;
  }

  if (loading) {
    return (
      <div className={`dashboard-bg${isDarkMode ? ' bg-dark text-white' : ''}`}>
        <h2 style={{textAlign: 'center', marginBottom: '2.2rem', fontWeight: 700}}>My Bookings</h2>
        <div className="container">
          <div className="loading">Loading your bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-bg${isDarkMode ? ' bg-dark text-white' : ''}`}>
      <h2 style={{textAlign: 'center', marginBottom: '2.2rem', fontWeight: 700}}>My Bookings</h2>
      {bookings.length === 0 ? (
        <div className="no-bookings d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
          <p className={isDarkMode ? 'text-secondary' : 'text-muted'} style={{ fontSize: '1.25rem', textAlign: 'center', maxWidth: 400 }}>
            You don't have any bookings yet.
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const startHour = parseInt(booking.time_start.split(':')[0]);
            const endHour = parseInt(booking.time_end.split(':')[0]);
            const duration = endHour - startHour;
            const isValid = duration > 0;
            const sportStyles = {
              badminton: { borderColor: '#27ae60', emoji: '🏸', label: 'Badminton' },
              basketball: { borderColor: '#e67e22', emoji: '🏀', label: 'Basketball' },
              tennis: { borderColor: '#2980b9', emoji: '🎾', label: 'Tennis' },
              futsal: { borderColor: '#8e44ad', emoji: '⚽', label: 'Futsal' },
            };
            const style = sportStyles[booking.court_type] || {};
            // Only allow end times after start time in edit form
            const filteredEndTimes = editingBooking?.id === booking.id && editingBooking.time_start
              ? timeSlots.filter(time => parseInt(time.split(':')[0]) > parseInt(editingBooking.time_start.split(':')[0]))
              : timeSlots;
            return (
              <div key={booking.id} className={`booking-card${isDarkMode ? ' bg-dark text-white border-secondary' : ''}`} style={{ borderLeft: `8px solid ${style.borderColor}` }}>
                {editingBooking?.id === booking.id ? (
                  // Edit Form
                  <div className="edit-booking-form">
                    {updateError && <div className="error-message">{updateError}</div>}
                    <form onSubmit={handleUpdateBooking}>
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={toDateInputValue(editingBooking.date)}
                          onChange={(e) => setEditingBooking({...editingBooking, date: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Start Time</label>
                        <select 
                          value={editingBooking.time_start} 
                          onChange={(e) => setEditingBooking({...editingBooking, time_start: e.target.value, time_end: ''})}
                          required
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>End Time</label>
                        <select 
                          value={editingBooking.time_end} 
                          onChange={(e) => setEditingBooking({...editingBooking, time_end: e.target.value})}
                          required
                        >
                          {filteredEndTimes.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      {editingBooking.time_start && editingBooking.time_end && parseInt(editingBooking.time_end.split(':')[0]) <= parseInt(editingBooking.time_start.split(':')[0]) && (
                        <div className="error-message">End time must be after start time.</div>
                      )}
                      <div className="edit-buttons">
                        <button type="submit" className="btn btn-primary" disabled={updateLoading || !editingBooking.time_start || !editingBooking.time_end || parseInt(editingBooking.time_end.split(':')[0]) <= parseInt(editingBooking.time_start.split(':')[0])}>
                          {updateLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  // Display Booking Info
                  <>
                    <div className="booking-info">
                      <div className="sport-header">
                        <span className="sport-emoji">{style.emoji}</span>
                        <span className={`sport-badge sport-badge-${booking.court_type}`}>{style.label}</span>
                        <span className="court-label">Court #{booking.court_number}</span>
                      </div>
                      <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                      <p><strong>Time:</strong> {formatTime(booking.time_start)} - {formatTime(booking.time_end)}</p>
                      <p><strong>Duration:</strong> {isValid ? `${duration} hours` : <span style={{color: '#e74c3c'}}>Invalid time selection</span>}</p>
                      <p><strong>Total Price:</strong> {isValid ? `RM${calculateBookingPrice(booking)}` : '-'}</p>
                      {booking.description && <p><strong>Notes:</strong> {booking.description}</p>}
                    </div>
                    <div className="booking-actions">
                      <button 
                        onClick={() => handleEditBooking(booking)}
                        className="btn btn-secondary"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        className="btn btn-danger"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 