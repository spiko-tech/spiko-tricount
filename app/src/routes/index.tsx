import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Spiko Tricount</h1>
        <p className="mt-4 text-lg text-gray-600">
          Share expenses with friends and settle debts with EUTBL tokens
        </p>
        <Link
          to="/tricounts"
          className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Tricounts
        </Link>
      </div>
    </div>
  );
}
