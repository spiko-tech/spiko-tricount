import { NodeRuntime } from '@effect/platform-node';
import { Layer } from 'effect';

import { ServerLive } from './presentation/index.js';

/**
 * Application entrypoint
 */
Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
