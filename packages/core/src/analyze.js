/**
 * Analyze extracted UI data to detect patterns and design system
 * @param {Object} extractedData - Data from extract()
 * @returns {Object} Analysis results
 */
export function analyze(extractedData) {
  if (!extractedData || extractedData.error) {
    return { error: extractedData?.error || 'Invalid extracted data' };
  }

  const elements = extractedData.elements || [];
  const cssVariables = extractedData.cssVariables || {};

  // Color analysis
  const colors = extractColors(elements, cssVariables);
  
  // Spacing analysis
  const spacing = extractSpacing(elements);
  
  // Border radius analysis
  const radius = extractRadius(elements);
  
  // Typography analysis
  const typography = extractTypography(elements);
  
  // Component classification
  const components = classifyComponents(elements);

  return {
    designSystem: {
      colors,
      spacing,
      radius,
      typography
    },
    components,
    patterns: detectPatterns(elements),
    stats: {
      totalElements: elements.length,
      uniqueColors: colors.all.length,
      uniqueSpacing: spacing.all.length,
      uniqueRadius: radius.all.length,
      uniqueFonts: typography.fonts.length
    }
  };
}

function extractColors(elements, cssVariables) {
  const colorProps = ['color', 'background-color', 'border-color', 'fill', 'stroke'];
  const colors = { all: [], backgrounds: [], text: [], borders: [], cssVariables: {} };
  const seen = new Set();

  // From CSS variables
  for (const [key, value] of Object.entries(cssVariables)) {
    if (isColor(value)) {
      colors.cssVariables[key] = value;
      addColor(colors.all, value, seen);
    }
  }

  // From computed styles
  for (const el of elements) {
    const styles = el.computedStyles || {};
    for (const prop of colorProps) {
      const value = styles[prop];
      if (value && isColor(value)) {
        addColor(colors.all, value, seen);
        if (prop === 'background-color') addColor(colors.backgrounds, value, seen);
        if (prop === 'color') addColor(colors.text, value, seen);
        if (prop === 'border-color') addColor(colors.borders, value, seen);
      }
    }
  }

  return colors;
}

function extractSpacing(elements) {
  const spacingProps = ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                        'gap', 'grid-gap'];
  const spacing = { all: [], padding: [], margin: [], gap: [] };
  const seen = new Set();

  for (const el of elements) {
    const styles = el.computedStyles || {};
    for (const prop of spacingProps) {
      const value = styles[prop];
      if (value && isLength(value)) {
        const num = parseFloat(value);
        if (num > 0) {
          addSpacing(spacing.all, num, seen);
          if (prop.startsWith('padding')) addSpacing(spacing.padding, num, seen);
          if (prop.startsWith('margin')) addSpacing(spacing.margin, num, seen);
          if (prop === 'gap' || prop === 'grid-gap') addSpacing(spacing.gap, num, seen);
        }
      }
    }
  }

  return spacing;
}

function extractRadius(elements) {
  const radiusProps = ['border-radius', 'border-top-left-radius', 'border-top-right-radius',
                       'border-bottom-left-radius', 'border-bottom-right-radius'];
  const radius = { all: [] };
  const seen = new Set();

  for (const el of elements) {
    const styles = el.computedStyles || {};
    for (const prop of radiusProps) {
      const value = styles[prop];
      if (value && isLength(value)) {
        const num = parseFloat(value);
        if (num > 0) addSpacing(radius.all, num, seen);
      }
    }
  }

  return radius;
}

function extractTypography(elements) {
  const typography = { fonts: [], fontSizes: [], fontWeights: [], lineHeights: [] };
  const fontSeen = new Set();
  const sizeSeen = new Set();
  const weightSeen = new Set();
  const lhSeen = new Set();

  for (const el of elements) {
    const styles = el.computedStyles || {};
    
    const family = styles['font-family'];
    if (family && !fontSeen.has(family)) {
      fontSeen.add(family);
      typography.fonts.push(family);
    }

    const size = styles['font-size'];
    if (size && isLength(size)) {
      const num = parseFloat(size);
      if (!sizeSeen.has(num)) {
        sizeSeen.add(num);
        typography.fontSizes.push(num);
      }
    }

    const weight = styles['font-weight'];
    if (weight && !weightSeen.has(weight)) {
      weightSeen.add(weight);
      typography.fontWeights.push(weight);
    }

    const lh = styles['line-height'];
    if (lh && lh !== 'normal' && !lhSeen.has(lh)) {
      lhSeen.add(lh);
      typography.lineHeights.push(lh);
    }
  }

  return typography;
}

function classifyComponents(elements) {
  const components = [];
  const seen = new Set();

  for (const el of elements) {
    const key = `${el.tagName}.${el.className || ''}.${el.id || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const type = inferComponentType(el);
    if (type !== 'unknown') {
      components.push({
        selector: buildSelector(el),
        type,
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        styles: el.computedStyles
      });
    }
  }

  return components;
}

function inferComponentType(el) {
  const { tagName, className = '', attributes = {} } = el;
  const cls = (className || '').toLowerCase();
  const role = attributes.role || '';

  // Button
  if (tagName === 'button' || role === 'button' || cls.includes('btn') || cls.includes('button')) {
    return 'button';
  }

  // Input
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || role === 'textbox') {
    return 'input';
  }

  // Card
  if (cls.includes('card') || cls.includes('tile')) {
    return 'card';
  }

  // Navigation
  if (tagName === 'nav' || cls.includes('nav') || cls.includes('menu') || role === 'navigation') {
    return 'navigation';
  }

  // Modal/Dialog
  if (role === 'dialog' || role === 'alertdialog' || cls.includes('modal') || cls.includes('dialog')) {
    return 'modal';
  }

  // Table
  if (tagName === 'table' || role === 'grid') {
    return 'table';
  }

  // List
  if (tagName === 'ul' || tagName === 'ol' || role === 'list' || cls.includes('list')) {
    return 'list';
  }

  // Heading
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    return 'heading';
  }

  // Image
  if (tagName === 'img' || role === 'img') {
    return 'image';
  }

  // Link
  if (tagName === 'a' || role === 'link') {
    return 'link';
  }

  // Form
  if (tagName === 'form') {
    return 'form';
  }

  return 'unknown';
}

function detectPatterns(elements) {
  const patterns = {
    flexbox: 0,
    grid: 0,
    absolutePositioning: 0,
    fixedPositioning: 0,
    mediaQueries: 0,
    animations: 0,
    transitions: 0
  };

  for (const el of elements) {
    const styles = el.computedStyles || {};
    
    if (styles.display === 'flex' || styles.display === 'inline-flex') patterns.flexbox++;
    if (styles.display === 'grid' || styles.display === 'inline-grid') patterns.grid++;
    if (styles.position === 'absolute') patterns.absolutePositioning++;
    if (styles.position === 'fixed') patterns.fixedPositioning++;
    if (styles.animation && styles.animation !== 'none') patterns.animations++;
    if (styles.transition && styles.transition !== 'none') patterns.transitions++;
  }

  return patterns;
}

function buildSelector(el) {
  let selector = el.tagName.toLowerCase();
  if (el.id) selector += `#${el.id}`;
  if (el.className) selector += `.${el.className.split(' ').join('.')}`;
  return selector;
}

function isColor(value) {
  return /^(rgb|rgba|hsl|hsla|#)[(#]/.test(value) || 
         /^(transparent|currentColor|inherit|initial|unset)$/.test(value) ||
         /^[a-z]+$/.test(value); // named colors
}

function isLength(value) {
  return /^\d+(\.\d+)?(px|rem|em|%)$/.test(value);
}

function addColor(arr, value, seen) {
  const normalized = normalizeColor(value);
  if (!seen.has(normalized)) {
    seen.add(normalized);
    arr.push(normalized);
  }
}

function addSpacing(arr, value, seen) {
  if (!seen.has(value)) {
    seen.add(value);
    arr.push(value);
  }
}

function normalizeColor(color) {
  // Simple normalization - could be enhanced
  return color.trim().toLowerCase();
}