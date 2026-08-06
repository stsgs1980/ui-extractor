/**
 * Generate component code from specification
 * @param {Object} spec - Component specification from generateSpec()
 * @param {Object} options - Generation options
 * @returns {Object} Generated code files
 */
export function generate(spec, options = {}) {
  if (!spec || spec.error) {
    return { error: spec?.error || 'Invalid spec' };
  }

  const format = options.format || 'react';

  switch (format) {
    case 'react':
      return generateReact(spec, options);
    case 'vue':
      return generateVue(spec, options);
    case 'html':
      return generateHTML(spec, options);
    default:
      return { error: `Unsupported format: ${format}` };
  }
}

function generateReact(spec, options) {
  const { name, props } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, '');
  const useTypeScript = options.typescript !== false;

  const propTypes = Object.entries(props || {}).map(([key, config]) => {
    const tsType = getTSType(config);
    const required = config.required ? '' : '?';
    const defaultVal = config.default !== undefined ? ` = ${JSON.stringify(config.default)}` : '';
    return `  ${key}${required}: ${tsType}${defaultVal};`;
  }).join('\n');

  const propDestructuring = Object.keys(props || {}).join(', ');
  const classNameHandling = `const classNames = ['${componentName.toLowerCase()}', className, variant && \`${componentName.toLowerCase()}--\${variant}\`, size && \`${componentName.toLowerCase()}--\${size}\`].filter(Boolean).join(' ');`;

  let componentCode;
  if (useTypeScript) {
    componentCode = `import React, { forwardRef } from 'react';

/**
 * @typedef {Object} ${componentName}Props
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Component content
 * @property {string} [variant='primary'] - Visual style variant
 * @property {string} [size='md'] - Button size
 * @property {boolean} [disabled=false] - Disable the button
 * @property {boolean} [loading=false] - Show loading state
 * @property {Function} [onClick] - Click handler
 * @property {'button'|'submit'|'reset'} [type='button'] - Native button type
 */

export const ${componentName} = forwardRef(
  ({ ${propDestructuring}, ...rest }, ref) => {
    ${classNameHandling}
    
    return (
      <button
        ref={ref}
        className={classNames}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

${componentName}.displayName = '${componentName}';
`;
  } else {
    componentCode = `import React, { forwardRef } from 'react';

export const ${componentName} = forwardRef(
  ({ ${propDestructuring}, ...rest }, ref) => {
    ${classNameHandling}
    
    return (
      <button
        ref={ref}
        className={classNames}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

${componentName}.displayName = '${componentName}';
`;
  }

  const cssCode = generateCSS(spec, 'react');

  return {
    [`${componentName}.${useTypeScript ? 'tsx' : 'jsx'}`]: componentCode,
    [`${componentName}.css`]: cssCode,
    [`${componentName}.stories.${useTypeScript ? 'tsx' : 'jsx'}`]: generateStorybook(spec)
  };
}

function generateVue(spec, _options) {
  const { name, props } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, '');

  const propDefinitions = Object.entries(props || {}).map(([key, config]) => {
    const type = getVueType(config);
    const required = config.required ? ', required: true' : '';
    const defaultVal = config.default !== undefined ? `, default: ${JSON.stringify(config.default)}` : '';
    return `  ${key}: { type: ${type}${required}${defaultVal} }`;
  }).join(',\n');

  const template = `<template>
  <button
    :class="['${componentName.toLowerCase()}', \`${componentName.toLowerCase()}--\${variant}\`, \`${componentName.toLowerCase()}--\${size}\`]"
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
${propDefinitions}
});

defineEmits(['click']);
</script>

<style scoped>
@import './${componentName}.css';
</style>`;

  const cssCode = generateCSS(spec, 'vue');

  return {
    [`${componentName}.vue`]: template,
    [`${componentName}.css`]: cssCode
  };
}

function generateHTML(spec, _options) {
  const { name } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
${generateCSS(spec, 'html')}
  </style>
</head>
<body>
  <button class="${componentName} ${componentName}--primary ${componentName}--md">
    Button
  </button>
  
  <script>
    // Component initialization if needed
  </script>
</body>
</html>`;

  return {
    [`${componentName}.html`]: html,
    [`${componentName}.css`]: generateCSS(spec, 'html')
  };
}

function generateCSS(spec, _format) {
  const { name, designTokens } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const tokens = designTokens || {};
  const colors = tokens.colors || {};
  const spacing = tokens.spacing || {};
  const radius = tokens.radius || {};

  const primaryColor = colors.primary || '#0066cc';
  const secondaryColor = colors.secondary || '#6c757d';
  const dangerColor = colors.danger || '#dc3545';
  const borderRadius = radius.scale?.[1] || '8';
  const spacingSm = spacing.scale?.[1] || '8';
  const spacingMd = spacing.scale?.[2] || '16';
  const spacingLg = spacing.scale?.[3] || '24';

  return `:root {
  --${componentName}-bg-primary: ${primaryColor};
  --${componentName}-bg-secondary: ${secondaryColor};
  --${componentName}-bg-danger: ${dangerColor};
  --${componentName}-text-on-primary: #fff;
  --${componentName}-border-radius: ${borderRadius}px;
  --${componentName}-spacing-sm: ${spacingSm}px;
  --${componentName}-spacing-md: ${spacingMd}px;
  --${componentName}-spacing-lg: ${spacingLg}px;
  --${componentName}-font-size: 1rem;
  --${componentName}-font-weight: 500;
  --${componentName}-transition: all 0.2s ease;
}

.${componentName} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--${componentName}-spacing-sm);
  padding: var(--${componentName}-spacing-sm) var(--${componentName}-spacing-md);
  font-size: var(--${componentName}-font-size);
  font-weight: var(--${componentName}-font-weight);
  line-height: 1.5;
  border: none;
  border-radius: var(--${componentName}-border-radius);
  cursor: pointer;
  transition: var(--${componentName}-transition);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

.${componentName}:focus-visible {
  outline: 2px solid var(--${componentName}-bg-primary);
  outline-offset: 2px;
}

.${componentName}:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variants */
.${componentName}--primary {
  background-color: var(--${componentName}-bg-primary);
  color: var(--${componentName}-text-on-primary);
}

.${componentName}--primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.${componentName}--secondary {
  background-color: var(--${componentName}-bg-secondary);
  color: var(--${componentName}-text-on-primary);
}

.${componentName}--outline {
  background-color: transparent;
  border: 1px solid var(--${componentName}-bg-primary);
  color: var(--${componentName}-bg-primary);
}

.${componentName}--ghost {
  background-color: transparent;
  color: var(--${componentName}-bg-primary);
}

.${componentName}--destructive {
  background-color: var(--${componentName}-bg-danger);
  color: var(--${componentName}-text-on-primary);
}

/* Sizes */
.${componentName}--sm {
  padding: 4px 12px;
  font-size: 0.875rem;
}

.${componentName}--lg {
  padding: 12px 24px;
  font-size: 1.125rem;
}

/* Loading state */
.${componentName}--loading {
  position: relative;
  color: transparent;
}

.${componentName}--loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${componentName}-spin 0.6s linear infinite;
}

@keyframes ${componentName}-spin {
  to { transform: rotate(360deg); }
}
`;
}

function generateStorybook(spec) {
  const { name } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, '');

  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outline = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Loading = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled',
  },
};
`;
}

function getTSType(config) {
  switch (config.type) {
    case 'string': return 'string';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'function': return '(...args: any[]) => void';
    case 'array': return 'any[]';
    case 'object': return 'Record<string, any>';
    case 'node': return 'React.ReactNode';
    default: return 'any';
  }
}

function getVueType(config) {
  switch (config.type) {
    case 'string': return 'String';
    case 'number': return 'Number';
    case 'boolean': return 'Boolean';
    case 'function': return 'Function';
    case 'array': return 'Array';
    case 'object': return 'Object';
    default: return 'String';
  }
}