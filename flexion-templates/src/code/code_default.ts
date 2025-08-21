/* eslint-disable @typescript-eslint/no-unused-vars */
import { COMMAND_PRIORITY_EDITOR } from 'flexion';
import React from 'react';

import { FlexionNodeTemplate } from '../FlexionNodeTemplate';


const config: FlexionNodeTemplate = {
  commands: [
    { name: 'BLUR_CODE_VALUE_COMMAND', payload_type: 'ValuePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'BLUR_NAME_VALUE_COMMAND', payload_type: 'ValuePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'CHANGE_CODE_VALUE_COMMAND', payload_type: 'ValuePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'CHANGE_NAME_VALUE_COMMAND', payload_type: 'ValuePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'CLICK_SEARCH_BUTTON_COMMAND', payload_type: 'BaseNodePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'DOUBLE_CLICK_CODE_VALUE_COMMAND', payload_type: 'BaseNodePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'FOCUS_VALUE_COMMAND', payload_type: 'BaseNodePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'KEY_DOWN_CODE_VALUE_COMMAND', payload_type: 'BaseNodePayload', priority: COMMAND_PRIORITY_EDITOR },
    { name: 'SELECT_CODE_ITEM_COMMAND', payload_type: 'ValuePayload', priority: COMMAND_PRIORITY_EDITOR },
  ],
  data_type: 'code',
  view_type: 'default',
};

interface NodeData {
  code: string;
  name: string;
  sid: string;
}

interface NodeState {
    display_name: string;
    hide_code: boolean;
    writable: {
        code: boolean;
        name: boolean;
    };
    fn: unknown;
    error?: {
        error_message: string;
        has_error: boolean;
    };

    default_value?: string;
    search_keyword: NodeData;
}

interface NodeProps {
  hide_code?: boolean;
  fn?: unknown;
  display_name?: string;
  data?: unknown;
  search_keyword?: {
    code: string;
    name: string;
    sid: string;
  };
  writable?: {
    name?: string;
  };
  error?: {
    error_message: string;
  };
  onChangeCode: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlurCode: (event: React.FocusEvent<HTMLInputElement>) => void;
  onDoubleClickCode: (event: React.MouseEvent<HTMLInputElement>) => void;
  onKeyDownCode: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
  onClickSearchButton: () => void;
  onChangeName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlurName: (event: React.FocusEvent<HTMLInputElement>) => void;
  onSelectItem: (event: unknown) => void;
}
