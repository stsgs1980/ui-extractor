import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  pipeline,
  pipelineFromReference,
  listReferences,
  extract,
  analyze,
  generateSpec,
  generate,
  compare
} from '@ui-extractor/core';

const server = new Server(
  {
    name: 'ui-extractor',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'uix_pipeline',
        description: 'Full pipeline: extract + analyze + spec + generate from URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to process' },
            component: { type: 'string', description: 'Component name to generate' },
            componentType: { type: 'string', enum: ['button', 'input', 'card', 'modal', 'navigation', 'generic'], description: 'Component type' },
            format: { type: 'string', enum: ['react', 'vue', 'html'], description: 'Output format' },
            typescript: { type: 'boolean', default: true, description: 'Use TypeScript' },
            screenshot: { type: 'boolean', default: false, description: 'Take screenshots' },
            screenshotTypes: { type: 'array', items: { type: 'string' }, default: ['viewport'], description: 'Screenshot types' },
            learn: { type: 'string', description: 'Save as reference name' },
          },
          required: ['url'],
        },
      },
      {
        name: 'uix_extract',
        description: 'Extract UI data from URL (DOM, styles, CSS variables, screenshots)',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to extract from' },
            screenshot: { type: 'boolean', default: false },
            screenshotTypes: { type: 'array', items: { type: 'string' }, default: ['viewport'] },
            viewport: { type: 'object', properties: { width: { type: 'number' }, height: { type: 'number' } } },
          },
          required: ['url'],
        },
      },
      {
        name: 'uix_analyze',
        description: 'Analyze patterns and design system from URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to analyze' },
          },
          required: ['url'],
        },
      },
      {
        name: 'uix_spec',
        description: 'Generate component specification from URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to analyze' },
            component: { type: 'string', description: 'Component name' },
            componentType: { type: 'string', enum: ['button', 'input', 'card', 'modal', 'navigation', 'generic'] },
          },
          required: ['url', 'component'],
        },
      },
      {
        name: 'uix_generate',
        description: 'Generate component code from URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to process' },
            component: { type: 'string', description: 'Component name' },
            componentType: { type: 'string', enum: ['button', 'input', 'card', 'modal', 'navigation', 'generic'] },
            format: { type: 'string', enum: ['react', 'vue', 'html'], description: 'Output format' },
            typescript: { type: 'boolean', default: true },
          },
          required: ['url', 'component', 'format'],
        },
      },
      {
        name: 'uix_learn',
        description: 'Learn and save a site as reference for future use',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to learn' },
            save: { type: 'string', description: 'Reference name' },
            component: { type: 'string', description: 'Component name to include' },
            componentType: { type: 'string' },
            format: { type: 'string', enum: ['react', 'vue', 'html'] },
            typescript: { type: 'boolean', default: true },
          },
          required: ['url', 'save'],
        },
      },
      {
        name: 'uix_references',
        description: 'List all saved references',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'uix_generate_from_reference',
        description: 'Generate component code from saved reference',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Reference name' },
            format: { type: 'string', enum: ['react', 'vue', 'html'], description: 'Output format' },
            typescript: { type: 'boolean', default: true },
          },
          required: ['name', 'format'],
        },
      },
      {
        name: 'uix_compare',
        description: 'Compare two URLs design systems and components',
        inputSchema: {
          type: 'object',
          properties: {
            url1: { type: 'string', description: 'First URL' },
            url2: { type: 'string', description: 'Second URL' },
          },
          required: ['url1', 'url2'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'uix_pipeline': {
        const results = await pipeline([args.url], {
          component: args.component,
          componentType: args.componentType,
          format: args.format,
          typescript: args.typescript,
          screenshot: args.screenshot,
          screenshotTypes: args.screenshotTypes,
          learn: args.learn,
        });
        return { content: [{ type: 'text', text: JSON.stringify(results[0], null, 2) }] };
      }

      case 'uix_extract': {
        const data = await extract(args.url, {
          screenshot: args.screenshot,
          screenshotTypes: args.screenshotTypes,
          viewport: args.viewport,
        });
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'uix_analyze': {
        const extracted = await extract(args.url);
        const analysis = analyze(extracted);
        return { content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }] };
      }

      case 'uix_spec': {
        const extracted = await extract(args.url);
        const analysis = analyze(extracted);
        const spec = generateSpec(analysis, {
          componentName: args.component,
          componentType: args.componentType,
          source: args.url,
        });
        return { content: [{ type: 'text', text: JSON.stringify(spec, null, 2) }] };
      }

      case 'uix_generate': {
        const extracted = await extract(args.url);
        const analysis = analyze(extracted);
        const spec = generateSpec(analysis, {
          componentName: args.component,
          componentType: args.componentType,
          source: args.url,
        });
        const generated = generate(spec, {
          format: args.format,
          typescript: args.typescript,
        });
        return { content: [{ type: 'text', text: JSON.stringify(generated, null, 2) }] };
      }

      case 'uix_learn': {
        const results = await pipeline([args.url], {
          component: args.component,
          componentType: args.componentType,
          format: args.format,
          typescript: args.typescript,
          learn: args.save,
        });
        return { content: [{ type: 'text', text: JSON.stringify({ success: true, reference: args.save, result: results[0] }, null, 2) }] };
      }

      case 'uix_references': {
        const refs = await listReferences();
        return { content: [{ type: 'text', text: JSON.stringify(refs, null, 2) }] };
      }

      case 'uix_generate_from_reference': {
        const generated = await pipelineFromReference(args.name, {
          format: args.format,
          typescript: args.typescript,
        });
        return { content: [{ type: 'text', text: JSON.stringify(generated, null, 2) }] };
      }

      case 'uix_compare': {
        const comparison = await compare(args.url1, args.url2);
        return { content: [{ type: 'text', text: JSON.stringify(comparison, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UI Extractor MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});