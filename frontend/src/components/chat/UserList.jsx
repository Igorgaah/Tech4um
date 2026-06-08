import Avatar from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';

export default function UserList({ users = [], onPrivateMessage, isVisible = true, onToggle }) {
  const { user: currentUser } = useAuth();

  return (
    <div
      className={`flex flex-col border-l border-dark-600 bg-dark-800 transition-all duration-300 ${
        isVisible ? 'w-56' : 'w-0 overflow-hidden'
      }`}
    >
      {isVisible && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-300">
                Online
              </h3>
              <span className="text-xs text-dark-400">{users.length} membro{users.length !== 1 ? 's' : ''}</span>
            </div>
            <button
              onClick={onToggle}
              className="text-dark-400 hover:text-white transition-colors p-1 rounded"
              title="Ocultar membros"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {users.length === 0 ? (
              <p className="text-dark-400 text-xs text-center py-4">Nenhum usuário online</p>
            ) : (
              users.map((u) => {
                const isSelf = u.userId === currentUser?.id;
                return (
                  <div
                    key={u.userId}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${
                      isSelf
                        ? 'opacity-60 cursor-default'
                        : 'hover:bg-dark-600 cursor-pointer group'
                    }`}
                    onClick={() => !isSelf && onPrivateMessage?.({ id: u.userId, username: u.username })}
                    title={isSelf ? 'Você' : `Mensagem privada para ${u.username}`}
                  >
                    <Avatar username={u.username} avatarUrl={u.avatarUrl} size="sm" online={true} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isSelf ? 'text-brand-300' : 'text-dark-100 group-hover:text-white'}`}>
                        {u.username}
                        {isSelf && <span className="ml-1 text-xs text-dark-400">(você)</span>}
                      </p>
                    </div>
                    {!isSelf && (
                      <svg className="w-3.5 h-3.5 text-dark-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {!isVisible && (
        <button
          onClick={onToggle}
          className="h-full flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          title="Mostrar membros"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}
