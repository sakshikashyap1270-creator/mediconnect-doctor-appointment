import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const ChatWidget = ({ activeChatUser, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!activeChatUser) return;
    try {
      const data = await api.getMessages(activeChatUser.id);
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to load chat messages:', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // Poll every 4 seconds for simple real-time chat
    return () => clearInterval(interval);
  }, [activeChatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUser) return;
    try {
      const newMsg = await api.sendMessage({
        receiverId: activeChatUser.id,
        content: inputText
      });
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  if (!activeChatUser) return null;

  return (
    <div id="chat-widget" className="chat-widget" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="chat-header">
        <span className="chat-title">Chat with {activeChatUser.name} ({activeChatUser.role})</span>
        <button className="btn-icon" style={{ color: 'white', padding: '2px' }} onClick={onClose}>✕</button>
      </div>

      <div className="chat-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
            No messages yet. Send a message to start!
          </p>
        ) : (
          messages.map(m => {
            const isSelf = m.senderId === user.id || m.sender_id === user.id;
            return (
              <div 
                key={m.id} 
                style={{
                  alignSelf: isSelf ? 'flex-end' : 'flex-start',
                  backgroundColor: isSelf ? 'var(--primary)' : 'var(--border-color)',
                  color: isSelf ? 'var(--text-light)' : 'var(--text-main)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  maxWidth: '75%',
                  fontSize: '0.875rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {m.content}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area" style={{ display: 'flex', gap: '8px', padding: '8px', borderTop: '1px solid var(--border-color)' }}>
        <input 
          type="text" 
          id="chat-input-field" 
          className="form-control" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..." 
          style={{ flexGrow: 1 }}
        />
        <button type="submit" className="btn btn-primary btn-sm">Send</button>
      </form>
    </div>
  );
};

export default ChatWidget;
