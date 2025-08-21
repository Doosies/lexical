import { COMMAND_PRIORITY } from 'flexion';
// import { BaseNodePayload, ValuePayload } from 'FlexionNode';
    
export type CommandPayloadType = 'ValuePayload' | 'BaseNodePayload';
export interface FlexionNodeTemplate {
    data_type: string;
    view_type: string;
    commands?: {
            name: string;
            priority: COMMAND_PRIORITY;
            payload_type: CommandPayloadType;
    }[];
    plugin?: {
        required?: boolean;
    };
}
