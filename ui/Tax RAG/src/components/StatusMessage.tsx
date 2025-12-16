interface StatusMessageProps {
  message: string;
}

function StatusMessage({ message }: StatusMessageProps) {
  return (
    <div className="status">
      <span className="loading"></span> {message}
    </div>
  );
}

export default StatusMessage;






