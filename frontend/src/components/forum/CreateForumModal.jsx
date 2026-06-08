import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { forumsApi } from '../../services/api';
import { extractApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CreateForumModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório.';
    else if (form.name.trim().length < 3) e.name = 'Nome deve ter pelo menos 3 caracteres.';
    else if (form.name.trim().length > 100) e.name = 'Nome deve ter no máximo 100 caracteres.';
    if (form.description.length > 500) e.description = 'Descrição deve ter no máximo 500 caracteres.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await forumsApi.create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      toast.success(`Fórum "${res.data.forum.name}" criado com sucesso!`);
      onCreated?.(res.data.forum);
      onClose();
      setForm({ name: '', description: '' });
      setErrors({});
    } catch (err) {
      const msg = extractApiError(err);
      if (msg.toLowerCase().includes('nome')) {
        setErrors({ name: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setForm({ name: '', description: '' });
      setErrors({});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Criar Novo Fórum">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Fórum *"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ex: JavaScript, Python, DevOps..."
          error={errors.name}
          autoFocus
          maxLength={100}
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-dark-100 mb-1.5">
            Descrição <span className="text-dark-400">(opcional)</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descreva o propósito deste fórum..."
            rows={3}
            maxLength={500}
            disabled={loading}
            className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="text-xs text-red-400">{errors.description}</p>
            )}
            <p className="text-xs text-dark-400 ml-auto">{form.description.length}/500</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} fullWidth>
            Criar Fórum
          </Button>
        </div>
      </form>
    </Modal>
  );
}
