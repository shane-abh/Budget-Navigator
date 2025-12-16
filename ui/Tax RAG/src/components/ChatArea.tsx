import { forwardRef } from 'react';
import type { Message as MessageType, QueryOptimization as QueryOptimizationType } from '../types';
import Message from './Message';
import QueryOptimization from './QueryOptimization';
import StatusMessage from './StatusMessage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { preprocessContent } from '../utils/markdown';

interface ChatAreaProps {
  messages: MessageType[];
  currentOptimization: QueryOptimizationType | null;
  statusMessage: string;
  currentAnswer: string;
}

const ChatArea = forwardRef<HTMLDivElement, ChatAreaProps>(
  ({ messages, currentOptimization, statusMessage, currentAnswer }, ref) => {
    return (
      <div className="chat-area" ref={ref}>
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg} />
        ))}

        {currentOptimization && (
          <QueryOptimization optimization={currentOptimization} />
        )}

        {statusMessage && <StatusMessage message={statusMessage} />}

        {currentAnswer && (
          <div className="message assistant">
            <div className="message-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]}
              >
                {preprocessContent(currentAnswer)}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ChatArea.displayName = 'ChatArea';

export default ChatArea;

