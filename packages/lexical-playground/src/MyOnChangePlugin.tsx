/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {EditorState} from 'lexical';
import {useEffect} from 'react';

interface MyOnChangePluginProps {
  onChange: (editorState: EditorState) => void;
}
export function MyOnChangePlugin({onChange}: MyOnChangePluginProps) {
  // Access the editor through the LexicalComposerContext
  const [editor] = useLexicalComposerContext();

  // Wrap our listener in useEffect to handle the teardown and avoid stale references.
  useEffect(() => {
    // most listeners return a teardown function that can be called to clean them up.
    return editor.registerUpdateListener(({editorState}) => {
      // call onChange here to pass the latest state up to the parent.
      onChange(editorState);
    });
  }, [editor, onChange]);
  return null;
}
