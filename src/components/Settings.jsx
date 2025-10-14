import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState('');

    const { role } = useAuth();

  useEffect(() => {
    fetchLabels();
  }, []);
  
  if (role !== 'admin') return <div>Access denied.</div>;


  const fetchLabels = async () => {
    const { data } = await supabase.from('labels').select('*');
    setLabels(data);
  };

  const handleAddLabel = async () => {
    if (!newLabel) return;
    const { data } = await supabase.from('labels').insert({ name: newLabel }).select();
    setLabels([...labels, data[0]]);
    setNewLabel('');
  };

  const handleRenameLabel = async (id, newName) => {
    await supabase.from('labels').update({ name: newName }).eq('id', id);
    fetchLabels();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Settings - Labels</h1>
      <input
        type="text"
        value={newLabel}
        onChange={(e) => setNewLabel(e.target.value)}
        placeholder="New label name"
        className="border p-2 mr-2"
      />
      <button onClick={handleAddLabel} className="bg-green-500 text-white p-2">Add Label</button>
      <ul className="mt-4">
        {labels.map((label) => (
          <li key={label.id} className="mb-2">
            {label.name}
            <button onClick={() => {
              const newName = prompt('Rename to:', label.name);
              if (newName) handleRenameLabel(label.id, newName);
            }} className="ml-4 bg-yellow-500 text-white p-1">Rename</button>
          </li>
        ))}
      </ul>
    </div>
  );
}