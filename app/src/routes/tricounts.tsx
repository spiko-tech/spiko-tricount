import { createFileRoute, Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchTricounts, createTricount, deleteTricount } from '../api/tricounts.js';

export const Route = createFileRoute('/tricounts')({
  component: TricountsComponent,
});

function TricountsComponent() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const {
    data: tricounts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tricounts'],
    queryFn: fetchTricounts,
  });

  const createMutation = useMutation({
    mutationFn: createTricount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tricounts'] });
      setName('');
      setDescription('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTricount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tricounts'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tricount?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tricounts</h1>
          <Link to="/" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
            Back to Home
          </Link>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Create New Tricount</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
              disabled={createMutation.isPending || !name.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Tricount'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            {error instanceof Error ? error.message : 'An error occurred'}
          </div>
        )}
        {createMutation.error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            {createMutation.error instanceof Error ? createMutation.error.message : 'Failed to create tricount'}
          </div>
        )}
        {deleteMutation.error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete tricount'}
          </div>
        )}

        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Your Tricounts</h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : tricounts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No tricounts yet. Create one above!</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tricounts.map((tricount) => (
                <li key={tricount.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{tricount.name}</h3>
                      {tricount.description && <p className="mt-1 text-sm text-gray-500">{tricount.description}</p>}
                      <p className="mt-1 text-xs text-gray-400">
                        Created: {new Date(tricount.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(tricount.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
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
