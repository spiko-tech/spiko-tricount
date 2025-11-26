import { NodeRuntime } from '@effect/platform-node';
import { Layer } from 'effect';

import { ServerLive } from './presentation/index.js';

Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
