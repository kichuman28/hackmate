import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="p-4 bg-white shadow-md flex justify-between">
      <h1 className="text-xl font-bold">Hackathon Finder</h1>
      <div>
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
