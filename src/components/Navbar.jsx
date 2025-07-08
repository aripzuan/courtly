import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">
          Courtly
        </Link>
        <div className="navbar-nav ms-auto d-flex align-items-center">
          <Link to="/" className="nav-link">Home</Link>
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-outline-danger ms-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 