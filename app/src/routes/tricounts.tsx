import { createFileRoute, Link } from '@tanstack/react-router';
import { useLiveQuery } from '@tanstack/react-db';

import { getTricountsCollection } from '../collections/tricounts.js';
import { CreateTricountForm } from '../components/CreateTricountForm.js';
import type { Tricount } from '../api/tricounts.js';

export const Route = createFileRoute('/tricounts')({
  component: TricountsComponent,
});

function TricountsComponent() {
  const tricountsCollection = getTricountsCollection();

  const { data: tricounts = [], isLoading, isError } = useLiveQuery((q) => q.from({ tricount: tricountsCollection }));

  const handleDelete = (id: Tricount['id']) => {
    if (window.confirm('Are you sure you want to delete this tricount?')) {
      tricountsCollection.delete(id);
    }
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

        <CreateTricountForm />

        {isError && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">An error occurred while loading tricounts</div>
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
                      className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete
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
