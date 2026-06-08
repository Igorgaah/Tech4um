import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import ChatRoom from '../components/chat/ChatRoom';
import Loader from '../components/common/Loader';
import { forumsApi } from '../services/api';
import { extractApiError } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!forumId) return;

    forumsApi
      .getOne(forumId)
      .then((res) => {
        setForum(res.data.forum);
      })
      .catch((err) => {
        const msg = extractApiError(err);
        toast.error(msg);
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [forumId, navigate]);

  if (loading) return <Loader fullScreen />;
  if (!forum) return null;

  return (
    <div className="h-screen flex flex-col bg-dark-900 overflow-hidden">
      <Header
        title={`# ${forum.name}`}
        subtitle={forum.description || `${forum.message_count ?? 0} mensagens`}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-dark-700 bg-dark-800 text-xs text-dark-400">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Fóruns
        </button>
        <span>/</span>
        <span className="text-dark-200 font-medium">{forum.name}</span>
      </div>

      {/* Chat room fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        <ChatRoom forum={forum} />
      </div>
    </div>
  );
}
