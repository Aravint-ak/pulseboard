import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const callBackURL =
        import.meta.env.VITE_VERSEL_URL ||
        window.location.origin; // fallback to current origin
    console.log('callBackURL: ', callBackURL);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                navigate('/tickets');
            }
        });

        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        if (token) {
            supabase.auth.verifyOtp({ token, type: 'magiclink' })
                .then(({ error }) => {
                    if (error) setError(error.message);
                });
        }

        return () => authListener.subscription.unsubscribe();
    }, [navigate, location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${callBackURL}/login`,
            },
        });

        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setMessage('Check your email for the login link!');
            setEmail('');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form className="bg-white p-6 rounded shadow-md" onSubmit={handleLogin}>
                <h2 className="text-xl mb-4">Login with Email</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 mb-2 w-full"
                    required
                    aria-label="Email address"
                />
                {error && <p className="text-red-500 mb-2">{error}</p>}
                {message && <p className="text-green-500 mb-2">{message}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white p-2 w-full disabled:bg-blue-300"
                    aria-label="Send login link"
                >
                    {loading ? 'Sending...' : 'Send Login Link'}
                </button>
            </form>
        </div>
    );
}