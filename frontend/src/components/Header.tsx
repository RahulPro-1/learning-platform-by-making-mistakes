import { User } from '../types';

interface Props {
  user: User | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

function Header({ user, onAuthClick, onLogout }: Props) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">📚</span>
          <div>
            <h1 className="logo-title">Code Learning Assistant</h1>
            <p className="logo-subtitle">Your friendly AI tutor for C, C++, and Python</p>
          </div>
        </div>

        <div className="header-right">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">👤 {user.username}</span>
              <button className="logout-btn" onClick={onLogout}>Log out</button>
            </div>
          ) : (
            <button className="login-btn" onClick={onAuthClick}>
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
