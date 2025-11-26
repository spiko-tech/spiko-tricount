import { Schema } from 'effect';

export const TricountId = Schema.UUID.pipe(Schema.brand('TricountId'));
export type TricountId = typeof TricountId.Type;
