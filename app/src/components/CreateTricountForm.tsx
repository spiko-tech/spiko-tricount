import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';

import { createTricount } from '../api/tricounts.js';

export function CreateTricountForm() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createTricount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tricounts'] });
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: ({ value }) => {
      createMutation.mutate({
        name: value.name.trim(),
        description: value.description.trim() || null,
      });
    },
  });

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Create New Tricount</h2>
      {createMutation.error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
          {createMutation.error instanceof Error ? createMutation.error.message : 'Failed to create tricount'}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => (!value.trim() ? 'Name is required' : undefined),
          }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter tricount name"
              />
              {field.state.meta.isTouched && !field.state.meta.isValid && (
                <p className="mt-1 text-sm text-red-600">{field.state.meta.errors.join(', ')}</p>
              )}
            </div>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
          )}
        </form.Field>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit]) => (
            <button
              type="submit"
              disabled={createMutation.isPending || !canSubmit}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Tricount'}
            </button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
