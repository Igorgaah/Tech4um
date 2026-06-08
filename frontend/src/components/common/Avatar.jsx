import { getInitials, getAvatarColor } from '../../utils/helpers';

export default function Avatar({ username = '', avatarUrl = null, size = 'md', online = false, className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };
  const dotSizes = { xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-4 h-4' };

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[size]} ${getAvatarColor(username)} rounded-full flex items-center justify-center font-bold text-white`}
        >
          {getInitials(username)}
        </div>
      )}
      {online !== false && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-dark-800 ${
            online ? 'bg-green-500' : 'bg-dark-400'
          }`}
        />
      )}
    </div>
  );
}
