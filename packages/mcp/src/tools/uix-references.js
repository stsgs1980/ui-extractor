import { listReferences } from '@ui-extractor/core';

export const uixReferencesTool = {
  name: 'uix_references',
  description: 'List all saved references',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    const refs = await listReferences();
    return { content: [{ type: 'text', text: JSON.stringify(refs, null, 2) }] };
  }
};