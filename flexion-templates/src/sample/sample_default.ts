/* eslint-disable @typescript-eslint/no-unused-vars */
//import type { BaseNodePayload, ValuePayload } from '../common/CommonCommand';
import {COMMAND_PRIORITY_EDITOR} from 'flexion';

import {FlexionNodeTemplate} from '../FlexionNodeTemplate';

const config: FlexionNodeTemplate = {
    commands: [
        {
            name: 'DEFAULT_SCV',
            payload_type: 'BaseNodePayload',
            priority: COMMAND_PRIORITY_EDITOR,
        },
    ],
    data_type: 'sample',
    view_type: 'default',
};
