import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatMessageTime(dateString) {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return `Ontem ${format(date, 'HH:mm')}`;
  return format(date, "d MMM 'às' HH:mm", { locale: ptBR });
}

export function formatRelativeTime(dateString) {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function getInitials(username = '') {
  return username.slice(0, 2).toUpperCase();
}

export function getAvatarColor(username = '') {
  const colors = [
    'bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600',
    'bg-red-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
    'bg-orange-600', 'bg-cyan-600',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function extractApiError(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.errors?.[0]?.message ||
    err?.message ||
    'Ocorreu um erro inesperado.'
  );
}

export function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;

  for (const msg of messages) {
    const date = parseISO(msg.created_at);
    const dateLabel = isToday(date)
      ? 'Hoje'
      : isYesterday(date)
      ? 'Ontem'
      : format(date, "d 'de' MMMM", { locale: ptBR });

    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      groups.push({ type: 'date', label: dateLabel, id: `date-${msg.id}` });
    }
    groups.push({ type: 'message', ...msg });
  }

  return groups;
}
