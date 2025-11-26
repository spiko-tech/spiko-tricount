import { createFileRoute } from '@tanstack/react-router';

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
      </div>
    </div>
  );
}
