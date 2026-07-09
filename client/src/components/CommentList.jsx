import React, { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

const CommentList = ({ eventId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const commentsEndRef = useRef(null);

  const socket = useSocket(eventId, {
    new_comment: (data) => {
      if (data.eventId === eventId) {
        setComments((prev) => [...prev, data.comment]);
      }
    },
    delete_comment: (data) => {
      if (data.eventId === eventId) {
        setComments((prev) => prev.filter((comment) => comment.id !== data.commentId));
      }
    },
  });

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/events/${eventId}/comments`);
        if (response.success) {
          setComments(response.data.comments || []);
        }
      } catch (error) {
        console.error('Failed to fetch comments', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchComments();
    }
  }, [eventId]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await api.delete(`/events/${eventId}/comments/${commentId}`);
      if (response.success) {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  if (loading) {
    return <div className="mt-4 text-sm text-gray-500">Loading comments...</div>;
  }

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Comments ({comments.length})</h3>
      {comments.length === 0 ? (
        <p className="italic text-gray-500">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border border-gray-100 bg-white p-4 shadow-sm sm:rounded-lg sm:p-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full bg-gray-200" src={comment.avatar_url || 'https://via.placeholder.com/40'} alt={comment.name} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">{comment.name}</h4>
                    <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{comment.content}</p>
                </div>
                {user && user.id === comment.user_id && (
                  <button type="button" onClick={() => handleDelete(comment.id)} className="ml-2 text-red-500 transition hover:text-red-700" title="Delete Comment">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </li>
          ))}
          <div ref={commentsEndRef} />
        </ul>
      )}
    </div>
  );
};

export default CommentList;
