/* eslint-disable @typescript-eslint/no-unused-vars */
//import type { BaseNodePayload, ValuePayload } from '../common/CommonCommand';
import {COMMAND_PRIORITY_CRITICAL, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_LOW} from 'flexion';

import {FlexionNodeTemplate} from '../FlexionNodeTemplate';

const config: FlexionNodeTemplate = {
    commands: [
        {
            name: 'A',
            payload_type: 'ValuePayload',
            priority: COMMAND_PRIORITY_CRITICAL,
        },
        {
            name: 'D',
            payload_type: 'ValuePayload',
            priority: COMMAND_PRIORITY_EDITOR,
        },
        {
            name: 'B',
            payload_type: 'ValuePayload',
            priority: COMMAND_PRIORITY_EDITOR,
        },
        {
            name: 'C',
            payload_type: 'ValuePayload',
            priority: COMMAND_PRIORITY_LOW,
        },
    ],
    data_type: 'sample',
    view_type: 'anchor',
};