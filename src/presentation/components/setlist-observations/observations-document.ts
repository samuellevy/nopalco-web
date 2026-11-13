import type { JSONContent } from '@tiptap/core';

const documentPrefix = 'nopalco:richtext:v1:';

export const readObservationsDocument = (value: string): JSONContent => {
  if (value.startsWith(documentPrefix)) {
    try {
      const document = JSON.parse(value.slice(documentPrefix.length));
      if (document?.type === 'doc' && Array.isArray(document.content)) return document;
    } catch {
      return plainTextDocument(value);
    }
  }
  return plainTextDocument(value);
};

const plainTextDocument = (value: string): JSONContent => ({
  type: 'doc',
  content: value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => ({
      type: 'paragraph',
      ...(line ? { content: [{ type: 'text', text: line }] } : {}),
    })),
});

export const writeObservationsDocument = (document: JSONContent): string =>
  `${documentPrefix}${JSON.stringify(document)}`;
