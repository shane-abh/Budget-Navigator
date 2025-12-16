import { APP_CONFIG } from '../config';

interface HeaderProps {
  userName: string | null;
  questionsRemaining: number | null;
  onLogout: () => void;
}

function Header({ userName, questionsRemaining, onLogout }: HeaderProps) {
  const { maxQuestions } = APP_CONFIG;
  const remaining = questionsRemaining ?? 0;
  const percentage = Math.min((remaining / maxQuestions) * 100, 100);

  const getGaugeColor = () => {
    if (remaining <= 2) return 'critical';
    if (remaining <= 5) return 'warning';
    return 'normal';
  };

  return (
    <div className="header">
      {/* Top Status Bar */}
      <div className="header-top-bar">
        <div className="project-badge">
          BLUEPRINT 2025
        </div>
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>System Active</span>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="header-main">
        <div className="header-title">
          <span className="header-icon">🍁</span>
          <div className="header-text">
            <h1>Budget Navigator</h1>
            <p>Building Tomorrow's Canada</p>
          </div>
        </div>

        <div className="header-controls">
          {/* User Info */}
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">{userName || 'Guest'}</span>
          </div>

          {/* Questions Gauge */}
          <div className={`questions-gauge ${getGaugeColor()}`}>
            <span className="gauge-label">QUERIES</span>
            <div className="gauge-track">
              <div 
                className="gauge-fill" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="gauge-count">
              {questionsRemaining ?? '--'}/{maxQuestions}
            </span>
          </div>

          {/* Logout Button */}
          <button className="logout-btn" onClick={onLogout}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;

