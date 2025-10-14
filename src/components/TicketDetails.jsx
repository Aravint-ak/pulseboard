import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, role } = useAuth();
  const commentsRef = useRef(null);

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [id]);
  console.log(setError)

  const fetchTicket = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*, tickets_labels(labels(name))')
      .eq('id', id)
      .single();
    setTicket(data);
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });
    setComments(data);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment) return;
    const { data } = await supabase.from('comments').insert({
      ticket_id: id,
      author_id: user.id,
      body: newComment,
    }).select();
    setComments([...comments, data[0]]);
    setNewComment('');
    commentsRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!ticket) return <div>Ticket not found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">{ticket.title}</h1>
      <p>{ticket.description}</p>
      <p>Status: {ticket.status}</p>
      <div className="flex flex-wrap mb-4">
        {ticket.tickets_labels.map((tl) => (
          <span key={tl.label_id} className="bg-gray-200 px-2 py-1 mr-2 rounded">{tl.labels.name}</span>
        ))}
      </div>
      <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>
      <p>Updated: {new Date(ticket.updated_at).toLocaleString()}</p>
      {role === 'admin' && (
        <button onClick={async () => {
          await supabase.from('tickets').update({ status: 'closed' }).eq('id', id);
          fetchTicket();
        }} className="bg-red-500 text-white p-2 mt-2">Close Ticket</button>
      )}
      <h2 className="text-xl mt-6 mb-2">Comments</h2>
      <div className="border p-2 h-64 overflow-y-auto mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="mb-2">
            <p><strong>{comment.author_id}</strong> {new Date(comment.created_at).toLocaleString()}</p> {/* Fetch display_name if needed */}
            <p>{comment.body}</p>
          </div>
        ))}
        <div ref={commentsRef} />
      </div>
      <form onSubmit={handleAddComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add comment"
          className="border p-2 w-full mb-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2">Add Comment</button>
      </form>
    </div>
  );
}