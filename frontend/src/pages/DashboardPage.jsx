import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import ForumCard from '../components/forum/ForumCard';
import CreateForumModal from '../components/forum/CreateForumModal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import { forumsApi } from '../services/api';
import { extractApiError } from '../utils/helpers';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'messages', label: 'Mais mensagens' },
];

function sortForums(forums, sort) {
  const arr = [...forums];
  switch (sort) {
    case 'oldest': return arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    case 'name':   return arr.sort((a, b) => a.name.localeCompare(b.name));
    case 'messages': return arr.sort((a, b) => (b.message_count ?? 0) - (a.message_count ?? 0));
    default: return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [modalOpen, setModalOpen] = useState(false);
  const [total, setTotal] = useState(0);

  const loadForums = useCallback(async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await forumsApi.list({ search: searchTerm, limit: 100 });
      setForums(res.data.forums);
      setTotal(res.data.total);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadForums(search), 300);
    return () => clearTimeout(timer);
  }, [search, loadForums]);

  const handleForumCreated = (newForum) => {
    setForums((prev) => [newForum, ...prev]);
    setTotal((t) => t + 1);
    navigate(`/forum/${newForum.id}`);
  };

  const sortedForums = sortForums(forums, sort);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Fóruns</h1>
          <p className="text-dark-300 mt-1">
            {loading ? 'Carregando...' : `${total} fórum${total !== 1 ? 's' : ''} disponível${total !== 1 ? 'is' : ''}`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar fóruns..."
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field w-auto min-w-[160px] cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <Button onClick={() => setModalOpen(true)} className="flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Fórum
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" text="Carregando fóruns..." />
          </div>
        ) : sortedForums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center">
              <svg className="w-10 h-10 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            {search ? (
              <>
                <p className="text-white font-medium">Nenhum fórum encontrado</p>
                <p className="text-dark-300 text-sm">Tente pesquisar por outro termo</p>
                <Button variant="secondary" onClick={() => setSearch('')}>Limpar busca</Button>
              </>
            ) : (
              <>
                <p className="text-white font-medium">Nenhum fórum ainda</p>
                <p className="text-dark-300 text-sm">Seja o primeiro a criar um fórum!</p>
                <Button onClick={() => setModalOpen(true)}>Criar Fórum</Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedForums.map((forum) => (
              <ForumCard key={forum.id} forum={forum} />
            ))}
          </div>
        )}
      </main>

      <CreateForumModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleForumCreated}
      />
    </div>
  );
}
