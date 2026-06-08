import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/helpers';

const FORUM_COLORS = [
  'from-purple-600 to-indigo-700',
  'from-blue-600 to-cyan-700',
  'from-green-600 to-teal-700',
  'from-orange-600 to-red-700',
  'from-pink-600 to-rose-700',
  'from-yellow-600 to-amber-700',
];

function getForumColor(id) {
  return FORUM_COLORS[id % FORUM_COLORS.length];
}

export default function ForumCard({ forum }) {
  const navigate = useNavigate();

  return (
    <div
      className="card hover:border-brand-500/50 cursor-pointer transition-all duration-200
                 hover:shadow-lg hover:shadow-brand-900/20 hover:-translate-y-0.5 group"
      onClick={() => navigate(`/forum/${forum.id}`)}
    >
      {/* Color bar */}
      <div className={`h-1.5 rounded-t-xl bg-gradient-to-r ${getForumColor(forum.id)}`} />

      <div className="p-5">
        {/* Title */}
        <h3 className="text-white font-semibold text-base group-hover:text-brand-300 transition-colors truncate">
          # {forum.name}
        </h3>

        {/* Description */}
        {forum.description ? (
          <p className="text-dark-300 text-sm mt-1.5 line-clamp-2">{forum.description}</p>
        ) : (
          <p className="text-dark-500 text-sm mt-1.5 italic">Sem descrição</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-600">
          <div className="flex items-center gap-1.5 text-dark-300 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{forum.message_count ?? 0} mensagens</span>
          </div>

          {forum.creator_username && (
            <span className="text-xs text-dark-400 truncate max-w-[120px]">
              por @{forum.creator_username}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
