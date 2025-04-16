import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Astrikos</h1>
      <p className="mb-4">Your application description goes here.</p>
      <div className="flex gap-4">
        <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Login
        </Link>
        <Link to="/signup" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Sign Up
        </Link>
      </div>
    </div>
  );
}