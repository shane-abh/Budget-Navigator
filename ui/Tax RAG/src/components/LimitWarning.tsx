interface LimitWarningProps {
  onLogout: () => void;
}

function LimitWarning({ onLogout }: LimitWarningProps) {
  return (
    <div className="limit-warning">
      ⚠️ You've reached the session limit of questions. 
      Please <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>start a new session</a> to continue.
    </div>
  );
}

export default LimitWarning;




