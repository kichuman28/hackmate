import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';

const Navbar = () => {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="p-4 bg-white shadow-md flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        Hackathon Finder
      </Link>
      <div className="flex items-center space-x-4">
        {user && (
          <>
            <Link href="/profile" className="text-blue-500 hover:text-blue-700">
              Profile
            </Link>
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-700">
              Dashboard
            </Link>
          </>
        )}
        {user ? (
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        ) : (
          <button onClick={signInWithGoogle} className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign In with Google
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
