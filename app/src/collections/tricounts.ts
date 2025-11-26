import { createCollection } from '@tanstack/db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import type { QueryClient } from '@tanstack/react-query';
import { TricountId } from '@spiko-tricount/primitives';
import { fetchTricounts, createTricount, deleteTricount, type Tricount } from '../api/tricounts.js';

export const createTricountsCollection = (queryClient: QueryClient) =>
  createCollection(
    queryCollectionOptions({
      queryKey: ['tricounts'],
      queryFn: fetchTricounts,
      queryClient,
      getKey: (item: Tricount) => item.id,

      onInsert: async ({ transaction }) => {
        await Promise.all(
          transaction.mutations.map((mutation) =>
            createTricount({
              name: mutation.modified.name,
              description: mutation.modified.description,
            })
          )
        );
      },

      onDelete: async ({ transaction }) => {
        await Promise.all(transaction.mutations.map((mutation) => deleteTricount(mutation.key as TricountId)));
      },
    })
  );

export type TricountsCollection = ReturnType<typeof createTricountsCollection>;

let tricountsCollection: TricountsCollection | null = null;

export const initTricountsCollection = (queryClient: QueryClient): TricountsCollection => {
  tricountsCollection = createTricountsCollection(queryClient);
  return tricountsCollection;
};

export const getTricountsCollection = (): TricountsCollection => {
  if (!tricountsCollection) {
    throw new Error('Tricounts collection not initialized. Call initTricountsCollection first.');
  }
  return tricountsCollection;
};
