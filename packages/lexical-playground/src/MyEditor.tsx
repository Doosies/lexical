/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './MyEditor.css';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {EditorState} from 'lexical';

import {MyOnChangePlugin} from './MyOnChangePlugin';

const exampleTheme = {
  ltr: 'ltr',
  paragraph: 'editor-paragraph',
  rtl: 'rtl',
};
export function MyEditor() {
  const initialConfig = {
    namespace: 'MyEditor',
    onError: (error: Error) => {
      throw new Error(error.message);
    },
    theme: exampleTheme,
  };

  // const [editorState, setEditorState] = useState<EditorState>();

  function onChange(_editorState: EditorState) {
    //  setEditorState(_editorState);
    // console.log(editorState?.toJSON());
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            aria-placeholder="Enter some Text..."
            placeholder={<div>Enter some text...</div>}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <MyOnChangePlugin onChange={onChange} />
    </LexicalComposer>
  );
}
