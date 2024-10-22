import Navbar from '../components/Navbar';
import '../app/globals.css'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl">Welcome to Hackathon Finder!</h1>
      </main>
    </>
  );
}
