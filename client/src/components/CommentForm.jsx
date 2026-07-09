import React, { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

const CommentForm = ({ eventId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [someoneIsTyping, setSomeoneIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const { isAuthenticated, user } = useAuth();
  const typingTimeoutRef = useRef(null);

  const socket = useSocket(eventId, {
    typing: (data) => {
      if (data.eventId === eventId && data.userId !== user?.id) {
        setSomeoneIsTyping(true);
        setTypingUser(data.name || 'Someone');
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = window.setTimeout(() => setSomeoneIsTyping(false), 2500);
      }
    },
  });

  useEffect(() => () => window.clearTimeout(typingTimeoutRef.current), []);

  const handleTyping = (event) => {
    setContent(event.target.value);
    if (socket && isAuthenticated && user) {
      socket.emit('typing', { eventId, userId: user.id, name: user.name });
      window.clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim() || !isAuthenticated) return;

    try {
      const response = await api.post(`/events/${eventId}/comments`, { content });
      if (response.success) {
        setContent('');
        if (onCommentAdded) {
          onCommentAdded(response.data.comment);
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (!isAuthenticated) {
    return <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-600">Please log in to leave a comment.</div>;
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <textarea id="comment" rows="3" className="block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Add a comment..." value={content} onChange={handleTyping} required />
        <div className="flex items-center justify-between">
          <div className="h-5 text-sm italic text-gray-500">{someoneIsTyping ? `${typingUser} is typing...` : ''}</div>
          <button type="submit" disabled={!content.trim()} className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">Post Comment</button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
