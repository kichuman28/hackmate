import Navbar from '../components/Navbar';
import '../app/globals.css'
import Image from 'next/image';
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-end min-h-screen pb-32">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl font-bold mb-4">Think, plan, and track</h1>
          <h2 className="text-4xl text-gray-500 mb-8">all in one place</h2>
          <p className="text-xl mb-8">Efficiently manage your tasks and boost productivity.</p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg">
            Get free demo
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Image src="/sticky-note.png" alt="Sticky note" width={100} height={100} />
            <p className="mt-2">Plan tasks in easy drag-and-drop boards</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Image src="/task-list.png" alt="Task list" width={100} height={100} />
            <p className="mt-2">Today's tasks</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Image src="/integrations.png" alt="Integrations" width={100} height={100} />
            <p className="mt-2">100+ integrations</p>
          </div>
        </div>
      </main>
    </div>
  );
}
