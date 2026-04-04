#!/usr/bin/env node
/**
 * Project Modern CLI
 *
 * A command-line interface for evaluating packages and auditing dependencies.
 *
 * Usage:
 *   modern search <package>           # Search and evaluate a package
 *   modern audit                      # Audit current project dependencies
 *   modern compare <pkg1> <pkg2>      # Compare two packages
 *   modern report                     # Generate TOOLS.md report
 */

import { Command } from 'commander';
import { createClient } from '@projectmodern/api-client';
import { searchCommand } from './commands/search.js';
import { auditCommand } from './commands/audit.js';
import { compareCommand } from './commands/compare.js';
import pc from 'picocolors';

const program = new Command();
const client = createClient({
  baseUrl: process.env.MODERN_API_URL || 'http://localhost:3000',
});

program
  .name('modern')
  .description('Project Modern CLI - Evaluate and audit open source dependencies')
  .version('2.0.0');

program
  .command('search')
  .description('Search and evaluate a package')
  .argument('<package>', 'Package name to search')
  .option('-p, --platform <platform>', 'Package platform (npm, pypi, maven)', 'npm')
  .action(async (packageName: string, options: { platform?: string }) => {
    const code = await searchCommand(client, packageName, options);
    process.exit(code);
  });

program
  .command('audit')
  .description('Audit current project dependencies')
  .option('--path <path>', 'Path to package.json', './package.json')
  .option('-r, --report', 'Generate TOOLS.md report')
  .option('-o, --output <file>', 'Output file for report', 'TOOLS.md')
  .action(async (options: { path?: string; report?: boolean; output?: string }) => {
    const code = await auditCommand(client, options);
    process.exit(code);
  });

program
  .command('compare')
  .description('Compare multiple packages')
  .argument('<packages...>', 'Package names to compare')
  .action(async (packages: string[]) => {
    const code = await compareCommand(client, packages);
    process.exit(code);
  });

program
  .command('report')
  .description('Generate TOOLS.md report (alias for audit --report)')
  .option('--path <path>', 'Path to package.json', './package.json')
  .option('-o, --output <file>', 'Output file for report', 'TOOLS.md')
  .action(async (options: { path?: string; output?: string }) => {
    const code = await auditCommand(client, { ...options, report: true });
    process.exit(code);
  });

program.on('--help', () => {
  console.log('');
  console.log(pc.bold('Examples:'));
  console.log('  $ modern search react');
  console.log('  $ modern search lodash --platform npm');
  console.log('  $ modern audit');
  console.log('  $ modern audit --report');
  console.log('  $ modern compare react vue angular');
  console.log('  $ modern report --output REPORT.md');
  console.log('');
  console.log(pc.bold('Environment Variables:'));
  console.log('  MODERN_API_URL    API endpoint [default: http://localhost:3000]');
});

program.parse();
