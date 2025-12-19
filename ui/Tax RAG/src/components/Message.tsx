import type { Message as MessageType } from '../types';
import QueryOptimization from './QueryOptimization';
import Sources from './Sources';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { preprocessContent } from '../utils/markdown';
import { removeDangerousContent } from '../utils/inputValidation';

interface MessageProps {
  message: MessageType;
}

function Message({ message }: MessageProps) {
  return (
    <div>
      <div className={`message ${message.isUser ? 'user' : 'assistant'}`}>
        <div className="message-content">
          {message.isUser ? (
            // Remove dangerous content - React handles XSS escaping automatically
            removeDangerousContent(message.content)
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]}
            >
              {preprocessContent(message.content)}
            </ReactMarkdown>
          )}
        </div>
      </div>

      {message.optimization && (
        <QueryOptimization optimization={message.optimization} />
      )}

      {message.sources && message.sources.length > 0 && (
        <Sources sources={message.sources} totalDocs={message.totalDocs || 0} />
      )}
    </div>
  );
}

export default Message;

