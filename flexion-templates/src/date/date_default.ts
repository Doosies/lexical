/* eslint-disable @typescript-eslint/no-unused-vars */
import { COMMAND_PRIORITY_EDITOR } from 'flexion';
import React from 'react';

import { FlexionNodeTemplate } from '../FlexionNodeTemplate';


const config: FlexionNodeTemplate = {
  commands: [
    { name: 'CHANGE_DATE_VALUE_COMMAND', payload_type: 'ValuePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'ERROR_DATE_COMMAND', payload_type: 'ValuePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'KEYDOWN_DATE_COMMAND', payload_type: 'ValuePayload', priority: COMMAND_PRIORITY_EDITOR },
  ],
  data_type: 'date',
  view_type: 'default',
};

interface NodeData {
  date: string;
}

interface NodeState {
    display_name: string;
}

interface NodeProps {
  display_name?: string;
  onChangeDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlurDate: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDownDate: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}
