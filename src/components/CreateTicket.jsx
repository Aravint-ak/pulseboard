import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext'; // Updated to useAuth.js
import * as Yup from 'yup';

const schema = Yup.object().shape({
  title: Yup.string().required('Title required'),
  description: Yup.string().required('Description required'),
});

export default function CreateTicket({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await schema.validate({ title, description }, { abortEarly: false });
      const { data: ticket, error } = await supabase.from('tickets').insert({
        title,
        description,
        created_by: user.id,
      }).select();
      if (error) throw error;
      onCreate(ticket[0]);
      setTitle('');
      setDescription('');
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach((e) => { newErrors[e.path] = e.message; });
        setErrors(newErrors);
      } else {
        setErrors({ general: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md mb-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-2"
        aria-label="Ticket title"
        disabled={loading}
      />
      {errors.title && <p className="text-red-500">{errors.title}</p>}
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-2"
        aria-label="Ticket description"
        disabled={loading}
      />
      {errors.description && <p className="text-red-500">{errors.description}</p>}
      {errors.general && <p className="text-red-500">{errors.general}</p>}
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 w-full disabled:bg-blue-300"
        disabled={loading}
        aria-label="Create ticket"
      >
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}