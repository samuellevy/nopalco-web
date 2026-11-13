import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Undo2, Redo2 } from 'lucide-react';
import { readObservationsDocument, writeObservationsDocument } from './observations-document';
import * as R from './observations-rich-text.styles';

type Props = {
  content: string;
  editable?: boolean;
  disabled?: boolean;
  onChange?: (content: string) => void;
  ariaLabel?: string;
  toolbarLabel?: string;
};

export const ObservationsRichText = ({
  content,
  editable = false,
  disabled = false,
  onChange,
  ariaLabel = 'Observações do item',
  toolbarLabel = 'Formatação das observações',
}: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, code: false, codeBlock: false, horizontalRule: false }),
      UnderlineExtension,
    ],
    content: readObservationsDocument(content),
    editable: editable && !disabled,
    editorProps: {
      attributes: {
        role: editable ? 'textbox' : 'document',
        'aria-label': ariaLabel,
        'aria-multiline': 'true',
        'aria-readonly': String(!editable || disabled),
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange?.(current.isEmpty ? '' : writeObservationsDocument(current.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(readObservationsDocument(content))) {
      editor.commands.setContent(readObservationsDocument(content), false);
    }
  }, [editor, content]);

  useEffect(() => {
    editor?.setEditable(editable && !disabled);
  }, [editor, editable, disabled]);

  return (
    <R.Surface $editing={editable}>
      {editable && editor && (
        <R.Toolbar role="toolbar" aria-label={toolbarLabel} aria-orientation="horizontal">
          <R.Tool
            type="button"
            title="Negrito"
            aria-label="Negrito"
            aria-pressed={editor.isActive('bold')}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={18} />
          </R.Tool>
          <R.Tool
            type="button"
            title="Itálico"
            aria-label="Itálico"
            aria-pressed={editor.isActive('italic')}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={18} />
          </R.Tool>
          <R.Tool
            type="button"
            title="Sublinhado"
            aria-label="Sublinhado"
            aria-pressed={editor.isActive('underline')}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline size={18} />
          </R.Tool>
          <R.Tool
            type="button"
            title="Tachado"
            aria-label="Tachado"
            aria-pressed={editor.isActive('strike')}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={18} />
          </R.Tool>
          <R.Tool
            type="button"
            title="Lista com marcadores"
            aria-label="Lista com marcadores"
            aria-pressed={editor.isActive('bulletList')}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={18} />
          </R.Tool>
          <R.Tool
            type="button"
            title="Lista numerada"
            aria-label="Lista numerada"
            aria-pressed={editor.isActive('orderedList')}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={18} />
          </R.Tool>
          <R.Tool
            type="button"
            title="Citação / recuo"
            aria-label="Citação / recuo"
            aria-pressed={editor.isActive('blockquote')}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={18} />
          </R.Tool>
          <R.Tool
            type="button"
            title="Desfazer"
            aria-label="Desfazer"
            disabled={disabled || !editor.can().undo()}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 size={18} />
          </R.Tool>
          <R.Tool
            type="button"
            title="Refazer"
            aria-label="Refazer"
            disabled={disabled || !editor.can().redo()}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 size={18} />
          </R.Tool>
        </R.Toolbar>
      )}
      <R.Content $editing={editable}>
        <EditorContent editor={editor} />
      </R.Content>
    </R.Surface>
  );
};
