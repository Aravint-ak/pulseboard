import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import CreateTicket from './CreateTicket';
export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role } = useAuth();


  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select('*, tickets_labels(labels(name))');
    if (error) setError(error.message);
    else setTickets(data);
    setLoading(false);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.tickets_labels.some((tl) => tl.labels.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div>Error: {error}</div>;
  if (tickets.length === 0) return <div>No tickets found. Create one!</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Tickets</h1>
      <div className='flex gap-2 px-1'>
        <input
        type="text"
        placeholder="Search by title or label"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full"
        aria-label="Search tickets"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border p-2 mb-4"
        aria-label="Filter by status"
      >
        <option value="all">All</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>
      </div>
      <CreateTicket onCreate={(newTicket) => setTickets([...tickets, newTicket])} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map((ticket) => (
          <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="border p-4 rounded">
            <h2 className="font-bold">{ticket.title}</h2>
            <p>{ticket.description.slice(0, 100)}...</p>
            <p>Status: {ticket.status}</p>
            <div className="flex flex-wrap">
              {ticket.tickets_labels.map((tl) => (
                <span key={tl.label_id} className="bg-gray-200 px-2 py-1 mr-2 rounded">{tl.labels.name}</span>
              ))}
            </div>
            <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>
            {role === 'admin' && ticket.status === 'open' && (
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  await supabase.from('tickets').update({ status: 'closed' }).eq('id', ticket.id);
                  fetchTickets();
                }}
                className="bg-red-500 text-white p-1 mt-2"
                aria-label={`Close ticket ${ticket.title}`}
              >
                Close
              </button>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}