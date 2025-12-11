import { useForm } from '@tanstack/react-form';
import { DateTime, Schema } from 'effect';

import { getTricountsCollection } from '../collections/tricounts.js';
import { TricountId } from '@spiko-tricount/primitives';

export function CreateTricountForm() {
  const tricountsCollection = getTricountsCollection();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: ({ value }) => {
      const now = DateTime.unsafeNow();
      const id = Schema.decodeSync(TricountId)(crypto.randomUUID());

      tricountsCollection.insert({
        id,
        name: value.name.trim(),
        description: value.description.trim() || null,
        createdAt: now,
        updatedAt: now,
      });

      form.reset();
    },
  });

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Create New Tricount</h2>
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
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
              disabled={!canSubmit}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create Tricount
            </button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
