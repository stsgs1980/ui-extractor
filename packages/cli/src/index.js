#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { 
  pipeline, 
  pipelineFromReference, 
  listReferences, 
  compare,
  extract,
  analyze,
  generateSpec,
  generate
} from '@ui-extractor/core';
import fs from 'fs/promises';
import path from 'path';

program
  .name('uix')
  .description('UI Extractor - Extract components, styles, and patterns from websites')
  .version('0.1.0');

program
  .command('pipeline <urls...>')
  .description('Full pipeline: extract + analyze + spec + generate')
  .option('-c, --component <name>', 'Component name to generate spec for')
  .option('-t, --type <type>', 'Component type (button, input, card, modal, navigation)')
  .option('-f, --format <format>', 'Output format (react, vue, html)')
  .option('--ts', 'Use TypeScript', true)
  .option('-s, --screenshot', 'Take screenshots')
  .option('--screenshot-types <types>', 'Screenshot types (full,viewport,mobile,sections,components)', 'viewport')
  .option('-l, --learn <name>', 'Save as reference with given name')
  .option('-o, --output <dir>', 'Output directory')
  .action(async (urls, options) => {
    const spinner = ora('Running pipeline...').start();
    
    try {
      const results = await pipeline(urls, {
        component: options.component,
        componentType: options.type,
        format: options.format,
        typescript: options.ts,
        screenshot: options.screenshot,
        screenshotTypes: options.screenshotTypes.split(','),
        learn: options.learn
      });

      spinner.succeed('Pipeline completed');

      // Save output if requested
      if (options.output) {
        await fs.mkdir(options.output, { recursive: true });
        for (const result of results) {
          if (result.generated) {
            for (const [filename, content] of Object.entries(result.generated)) {
              await fs.writeFile(path.join(options.output, filename), content);
            }
          }
        }
        console.log(chalk.green(`Output saved to ${options.output}`));
      }

      // Print summary
      for (const result of results) {
        console.log(chalk.cyan(`\n--- ${result.url} ---`));
        if (result.success) {
          console.log(chalk.green('✓ Success'));
          if (result.analysis?.stats) {
            console.log(`  Elements: ${result.analysis.stats.totalElements}`);
            console.log(`  Colors: ${result.analysis.stats.uniqueColors}`);
            console.log(`  Spacing: ${result.analysis.stats.uniqueSpacing}`);
          }
          if (result.generated) {
            console.log(chalk.green(`  Generated: ${Object.keys(result.generated).join(', ')}`));
          }
          if (result.reference) {
            console.log(chalk.green(`  Reference saved: ${result.reference}`));
          }
        } else {
          console.log(chalk.red(`✗ Failed: ${result.error}`));
        }
      }
    } catch (error) {
      spinner.fail('Pipeline failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('extract <url>')
  .description('Extract UI data from URL')
  .option('-s, --screenshot', 'Take screenshots')
  .option('--screenshot-types <types>', 'Screenshot types', 'viewport')
  .option('-o, --output <file>', 'Output JSON file')
  .action(async (url, options) => {
    const spinner = ora('Extracting...').start();
    
    try {
      const data = await extract(url, {
        screenshot: options.screenshot,
        screenshotTypes: options.screenshotTypes.split(',')
      });

      spinner.succeed('Extraction completed');

      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(data, null, 2));
        console.log(chalk.green(`Saved to ${options.output}`));
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      spinner.fail('Extraction failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('analyze <url>')
  .description('Analyze patterns and design system from URL')
  .option('-o, --output <file>', 'Output JSON file')
  .action(async (url, options) => {
    const spinner = ora('Analyzing...').start();
    
    try {
      const extracted = await extract(url);
      const analysis = analyze(extracted);

      spinner.succeed('Analysis completed');

      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(analysis, null, 2));
        console.log(chalk.green(`Saved to ${options.output}`));
      } else {
        console.log(JSON.stringify(analysis, null, 2));
      }
    } catch (error) {
      spinner.fail('Analysis failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('spec <url>')
  .description('Generate component specification from URL')
  .requiredOption('-c, --component <name>', 'Component name')
  .option('-t, --type <type>', 'Component type')
  .option('-o, --output <file>', 'Output JSON file')
  .action(async (url, options) => {
    const spinner = ora('Generating spec...').start();
    
    try {
      const extracted = await extract(url);
      const analysis = analyze(extracted);
      const spec = generateSpec(analysis, {
        componentName: options.component,
        componentType: options.type,
        source: url
      });

      spinner.succeed('Spec generated');

      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(spec, null, 2));
        console.log(chalk.green(`Saved to ${options.output}`));
      } else {
        console.log(JSON.stringify(spec, null, 2));
      }
    } catch (error) {
      spinner.fail('Spec generation failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('generate <url>')
  .description('Generate component code from URL')
  .requiredOption('-c, --component <name>', 'Component name')
  .requiredOption('-f, --format <format>', 'Output format (react, vue, html)')
  .option('-t, --type <type>', 'Component type')
  .option('--ts', 'Use TypeScript', true)
  .option('-o, --output <dir>', 'Output directory')
  .action(async (url, options) => {
    const spinner = ora('Generating code...').start();
    
    try {
      const extracted = await extract(url);
      const analysis = analyze(extracted);
      const spec = generateSpec(analysis, {
        componentName: options.component,
        componentType: options.type,
        source: url
      });
      const generated = generate(spec, {
        format: options.format,
        typescript: options.ts
      });

      spinner.succeed('Code generated');

      if (options.output) {
        await fs.mkdir(options.output, { recursive: true });
        for (const [filename, content] of Object.entries(generated)) {
          await fs.writeFile(path.join(options.output, filename), content);
        }
        console.log(chalk.green(`Saved to ${options.output}`));
      } else {
        for (const [filename, content] of Object.entries(generated)) {
          console.log(chalk.cyan(`\n--- ${filename} ---`));
          console.log(content);
        }
      }
    } catch (error) {
      spinner.fail('Code generation failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('learn <url>')
  .description('Learn and save a site as reference')
  .requiredOption('-s, --save <name>', 'Reference name')
  .option('-c, --component <name>', 'Component name to include in spec')
  .option('-t, --type <type>', 'Component type')
  .option('-f, --format <format>', 'Output format to include')
  .option('--ts', 'Use TypeScript', true)
  .action(async (url, options) => {
    const spinner = ora('Learning...').start();
    
    try {
      const _results = await pipeline([url], {
        component: options.component,
        componentType: options.type,
        format: options.format,
        typescript: options.ts,
        learn: options.save
      });

      spinner.succeed('Reference saved');
      console.log(chalk.green(`Reference "${options.save}" created`));
    } catch (error) {
      spinner.fail('Learn failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('references')
  .description('List saved references')
  .action(async () => {
    const refs = await listReferences();
    
    if (refs.length === 0) {
      console.log(chalk.yellow('No references saved'));
    } else {
      console.log(chalk.cyan('Saved references:'));
      for (const ref of refs) {
        console.log(`  - ${ref}`);
      }
    }
  });

program
  .command('generate-ref <name>')
  .description('Generate component code from saved reference')
  .requiredOption('-f, --format <format>', 'Output format (react, vue, html)')
  .option('--ts', 'Use TypeScript', true)
  .option('-o, --output <dir>', 'Output directory')
  .action(async (name, options) => {
    const spinner = ora('Generating from reference...').start();
    
    try {
      const generated = await pipelineFromReference(name, {
        format: options.format,
        typescript: options.ts
      });

      spinner.succeed('Code generated');

      if (options.output) {
        await fs.mkdir(options.output, { recursive: true });
        for (const [filename, content] of Object.entries(generated)) {
          await fs.writeFile(path.join(options.output, filename), content);
        }
        console.log(chalk.green(`Saved to ${options.output}`));
      } else {
        for (const [filename, content] of Object.entries(generated)) {
          console.log(chalk.cyan(`\n--- ${filename} ---`));
          console.log(content);
        }
      }
    } catch (error) {
      spinner.fail('Generation failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('screenshot <url>')
  .description('Take screenshots of a URL')
  .option('--types <types>', 'Screenshot types (full,viewport,mobile,sections,components)', 'full,viewport')
  .option('-o, --output <dir>', 'Output directory')
  .action(async (url, options) => {
    const spinner = ora('Taking screenshots...').start();
    
    try {
      const data = await extract(url, {
        screenshot: true,
        screenshotTypes: options.types.split(',')
      });

      spinner.succeed('Screenshots taken');

      if (options.output && data.screenshots) {
        await fs.mkdir(options.output, { recursive: true });
        for (const [type, buffer] of Object.entries(data.screenshots)) {
          await fs.writeFile(path.join(options.output, `screenshot-${type}.png`), buffer);
        }
        console.log(chalk.green(`Saved to ${options.output}`));
      }
    } catch (error) {
      spinner.fail('Screenshot failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('compare <url1> <url2>')
  .description('Compare two URLs')
  .option('-o, --output <file>', 'Output JSON file')
  .action(async (url1, url2, options) => {
    const spinner = ora('Comparing...').start();
    
    try {
      const comparison = await compare(url1, url2);

      spinner.succeed('Comparison completed');

      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(comparison, null, 2));
        console.log(chalk.green(`Saved to ${options.output}`));
      } else {
        console.log(JSON.stringify(comparison, null, 2));
      }
    } catch (error) {
      spinner.fail('Comparison failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse();