import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';

interface Tricount {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TricountsListResponse {
  tricounts: Tricount[];
}

export const Route = createFileRoute('/tricounts')({
  component: TricountsComponent,
});

function TricountsComponent() {
  const [tricounts, setTricounts] = useState<Tricount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchTricounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/tricounts');
      if (!response.ok) {
        throw new Error('Failed to fetch tricounts');
      }
      const data: TricountsListResponse = await response.json();
      setTricounts(data.tricounts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTricounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsCreating(true);
      const response = await fetch('http://localhost:3000/tricounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tricount');
      }

      setName('');
      setDescription('');
      await fetchTricounts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create tricount'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tricounts</h1>
          <Link
            to="/"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Back to Home
          </Link>
        </div>

        {/* Create form */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Create New Tricount
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter tricount name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Tricount'}
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Tricounts list */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Tricounts
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : tricounts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tricounts yet. Create one above!
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tricounts.map((tricount) => (
                <li key={tricount.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {tricount.name}
                      </h3>
                      {tricount.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {tricount.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        Created:{' '}
                        {new Date(tricount.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
