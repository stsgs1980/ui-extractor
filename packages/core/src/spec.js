/**
 * Generate component specification from analyzed data
 * @param {Object} analysis - Analysis results from analyze()
 * @param {Object} options - Spec generation options
 * @returns {Object} Component specification
 */
export function generateSpec(analysis, options = {}) {
  if (!analysis || analysis.error) {
    return { error: analysis?.error || 'Invalid analysis data' };
  }

  const { designSystem, _components } = analysis;
  const componentName = options.componentName || 'Component';
  const componentType = options.componentType || 'generic';

  const spec = {
    name: componentName,
    type: componentType,
    description: options.description || '',
    props: generateProps(designSystem, componentType),
    states: generateStates(componentType),
    variants: generateVariants(designSystem, componentType),
    accessibility: generateAccessibility(componentType),
    responsive: generateResponsive(designSystem),
    designTokens: extractDesignTokens(designSystem),
    examples: generateExamples(componentType),
    metadata: {
      generatedAt: new Date().toISOString(),
      source: options.source || 'unknown'
    }
  };

  return spec;
}

function generateProps(designSystem, componentType) {
  const baseProps = {
    className: { type: 'string', description: 'Additional CSS classes', required: false },
    children: { type: 'node', description: 'Component content', required: false },
    'data-testid': { type: 'string', description: 'Test identifier', required: false }
  };

  const typeProps = {
    button: {
      variant: { type: 'string', enum: ['primary', 'secondary', 'outline', 'ghost', 'destructive'], default: 'primary', description: 'Visual style variant' },
      size: { type: 'string', enum: ['sm', 'md', 'lg'], default: 'md', description: 'Button size' },
      disabled: { type: 'boolean', default: false, description: 'Disable the button' },
      loading: { type: 'boolean', default: false, description: 'Show loading state' },
      onClick: { type: 'function', description: 'Click handler' },
      type: { type: 'string', enum: ['button', 'submit', 'reset'], default: 'button', description: 'Native button type' }
    },
    input: {
      type: { type: 'string', enum: ['text', 'email', 'password', 'number', 'tel', 'url'], default: 'text' },
      placeholder: { type: 'string', description: 'Placeholder text' },
      value: { type: 'string', description: 'Input value (controlled)' },
      defaultValue: { type: 'string', description: 'Default value (uncontrolled)' },
      disabled: { type: 'boolean', default: false },
      required: { type: 'boolean', default: false },
      error: { type: 'string', description: 'Error message' },
      label: { type: 'string', description: 'Label text' },
      onChange: { type: 'function', description: 'Change handler' },
      onBlur: { type: 'function', description: 'Blur handler' }
    },
    card: {
      variant: { type: 'string', enum: ['elevated', 'outlined', 'filled'], default: 'elevated' },
      padding: { type: 'string', enum: ['none', 'sm', 'md', 'lg'], default: 'md' },
      hoverable: { type: 'boolean', default: false },
      onClick: { type: 'function' }
    },
    modal: {
      open: { type: 'boolean', default: false, required: true },
      onClose: { type: 'function', required: true, description: 'Close handler' },
      title: { type: 'string', description: 'Modal title' },
      size: { type: 'string', enum: ['sm', 'md', 'lg', 'xl', 'full'], default: 'md' },
      closeOnOverlayClick: { type: 'boolean', default: true },
      closeOnEscape: { type: 'boolean', default: true }
    },
    navigation: {
      items: { type: 'array', description: 'Navigation items', required: true },
      orientation: { type: 'string', enum: ['horizontal', 'vertical'], default: 'horizontal' },
      activeItem: { type: 'string', description: 'Active item key' },
      onSelect: { type: 'function', description: 'Selection handler' }
    }
  };

  return {
    ...baseProps,
    ...(typeProps[componentType] || {})
  };
}

function generateStates(componentType) {
  const baseStates = {
    default: { description: 'Default state' },
    hover: { description: 'Hover state' },
    focus: { description: 'Focus state (keyboard navigation)' },
    active: { description: 'Active/pressed state' },
    disabled: { description: 'Disabled state' }
  };

  const typeStates = {
    button: {
      ...baseStates,
      loading: { description: 'Loading state with spinner' }
    },
    input: {
      ...baseStates,
      error: { description: 'Validation error state' },
      filled: { description: 'Has value' },
      placeholder: { description: 'Showing placeholder' }
    },
    card: {
      ...baseStates,
      selected: { description: 'Selected state (for selectable cards)' }
    },
    modal: {
      open: { description: 'Modal is visible' },
      closed: { description: 'Modal is hidden' },
      closing: { description: 'Closing animation' }
    }
  };

  return typeStates[componentType] || baseStates;
}

function generateVariants(designSystem, componentType) {
  const { colors, _spacing, _radius } = designSystem || {};
  
  const variants = {};
  
  // Generate variants based on design system tokens
  if (componentType === 'button') {
    variants.primary = { description: 'Primary action', tokens: { bg: colors.cssVariables?.['--color-primary'] || '#0066cc', color: '#fff' } };
    variants.secondary = { description: 'Secondary action', tokens: { bg: colors.cssVariables?.['--color-secondary'] || '#6c757d', color: '#fff' } };
    variants.outline = { description: 'Outlined style', tokens: { bg: 'transparent', border: colors.cssVariables?.['--color-primary'] || '#0066cc', color: colors.cssVariables?.['--color-primary'] || '#0066cc' } };
    variants.ghost = { description: 'Ghost style', tokens: { bg: 'transparent', color: colors.cssVariables?.['--color-primary'] || '#0066cc' } };
    variants.destructive = { description: 'Destructive action', tokens: { bg: colors.cssVariables?.['--color-danger'] || '#dc3545', color: '#fff' } };
  }

  return variants;
}

function generateAccessibility(componentType) {
  const baseA11y = {
    keyboardNavigation: 'Full keyboard support',
    ariaAttributes: ['aria-label', 'aria-describedby', 'aria-expanded', 'aria-controls'],
    focusManagement: 'Focus trap for modals, visible focus indicators',
    colorContrast: 'WCAG AA minimum 4.5:1',
    screenReader: 'Semantic HTML, proper labels'
  };

  const typeA11y = {
    button: {
      ...baseA11y,
      role: 'button',
      ariaPressed: 'For toggle buttons',
      ariaDisabled: 'When disabled'
    },
    input: {
      ...baseA11y,
      role: 'textbox',
      ariaRequired: 'When required',
      ariaInvalid: 'When error',
      ariaDescribedBy: 'Links to error/help text',
      labelAssociation: 'Explicit <label for> or aria-label'
    },
    modal: {
      ...baseA11y,
      role: 'dialog',
      ariaModal: 'true',
      ariaLabelledBy: 'References title',
      ariaDescribedBy: 'References description',
      focusTrap: 'Required',
      restoreFocus: 'On close'
    }
  };

  return typeA11y[componentType] || baseA11y;
}

function generateResponsive(_designSystem) {
  const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  };

  return {
    breakpoints,
    container: 'max-width: 1280px; margin: 0 auto; padding: 0 1rem;',
    spacing: 'Fluid spacing using clamp() or responsive tokens',
    typography: 'Fluid type scale'
  };
}

function extractDesignTokens(designSystem) {
  const { colors, spacing, radius, typography } = designSystem || {};
  
  return {
    colors: {
      primary: colors.cssVariables?.['--color-primary'] || '#0066cc',
      secondary: colors.cssVariables?.['--color-secondary'] || '#6c757d',
      success: colors.cssVariables?.['--color-success'] || '#28a745',
      danger: colors.cssVariables?.['--color-danger'] || '#dc3545',
      warning: colors.cssVariables?.['--color-warning'] || '#ffc107',
      info: colors.cssVariables?.['--color-info'] || '#17a2b8',
      light: colors.cssVariables?.['--color-light'] || '#f8f9fa',
      dark: colors.cssVariables?.['--color-dark'] || '#343a40',
      backgrounds: colors.backgrounds?.slice(0, 10) || [],
      text: colors.text?.slice(0, 10) || [],
      borders: colors.borders?.slice(0, 10) || []
    },
    spacing: {
      scale: spacing.all?.sort((a, b) => a - b).slice(0, 20) || [4, 8, 12, 16, 24, 32, 48, 64]
    },
    radius: {
      scale: radius.all?.sort((a, b) => a - b).slice(0, 10) || [4, 8, 12, 16]
    },
    typography: {
      fonts: typography.fonts || ['system-ui', 'sans-serif'],
      sizes: typography.fontSizes?.sort((a, b) => a - b) || [12, 14, 16, 18, 20, 24, 30, 36, 48],
      weights: typography.fontWeights || ['400', '500', '600', '700']
    }
  };
}

function generateExamples(componentType) {
  const examples = {
    button: [
      { name: 'Primary', code: '<Button variant="primary">Click me</Button>' },
      { name: 'Secondary', code: '<Button variant="secondary">Click me</Button>' },
      { name: 'Loading', code: '<Button variant="primary" loading>Loading...</Button>' },
      { name: 'Disabled', code: '<Button variant="primary" disabled>Disabled</Button>' }
    ],
    input: [
      { name: 'Basic', code: '<Input placeholder="Enter text..." />' },
      { name: 'With Label', code: '<Input label="Email" type="email" placeholder="you@example.com" />' },
      { name: 'Error', code: '<Input error="Invalid email" value="invalid" />' }
    ],
    card: [
      { name: 'Elevated', code: '<Card variant="elevated">Content</Card>' },
      { name: 'Outlined', code: '<Card variant="outlined">Content</Card>' }
    ],
    modal: [
      { name: 'Basic', code: '<Modal open onClose={handleClose} title="Title">Content</Modal>' }
    ]
  };

  return examples[componentType] || [];
}