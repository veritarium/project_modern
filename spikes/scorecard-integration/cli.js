#!/usr/bin/env node
/**
 * Project Modern - Phase 1: CLI Tool
 * 
 * A command-line interface that uses the Project Modern API
 * to evaluate packages and audit project dependencies.
 * 
 * Usage:
 *   modern search <package>           # Search and evaluate a package
 *   modern audit                      # Audit current project dependencies
 *   modern compare <pkg1> <pkg2>      # Compare two packages
 *   modern report                     # Generate TOOLS.md report
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';

const API_BASE = process.env.MODERN_API_URL || 'http://localhost:3000';

// ============================================================================
// UTILITIES
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function color(name, text) {
  return `${colors[name]}${text}${colors.reset}`;
}

function formatScore(score) {
  const icon = score >= 8 ? '✅' : score >= 6 ? '⚠️' : '❌';
  const colorName = score >= 8 ? 'green' : score >= 6 ? 'yellow' : 'red';
  return `${icon} ${color(colorName, score.toFixed(1))}/10`;
}

function formatGrade(grade) {
  const colors = { A: 'green', B: 'yellow', C: 'yellow', D: 'red', F: 'red' };
  return color(colors[grade] || 'dim', grade);
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      throw new Error(
        `Cannot connect to Project Modern API at ${API_BASE}\n` +
        `Make sure the API server is running: npm start`
      );
    }
    throw error;
  }
}

// ============================================================================
// COMMANDS
// ============================================================================

async function searchCommand(args) {
  const packageName = args[0];
  const platform = args.platform || args.p || 'npm';
  
  if (!packageName) {
    console.log(color('red', 'Error: Package name required'));
    console.log('Usage: modern search <package> [--platform npm|pypi|maven]');
    return 1;
  }
  
  console.log(`🔍 Evaluating ${color('cyan', `${platform}/${packageName}`)}...\n`);
  
  try {
    const data = await fetchAPI(`/tools/${platform}/${packageName}`);
    
    // Header
    console.log('='.repeat(60));
    console.log(`📦 ${color('bright', data.name)} ${color('dim', `(${data.platform})`)}`);
    console.log('='.repeat(60));
    
    // Score
    const eval_ = data.evaluation;
    console.log(`\n🏆 ${color('bright', 'Project Modern Score:')} ${formatScore(eval_.composite)} ${color('dim', `(${formatGrade(eval_.grade)})`)}`);
    
    // Breakdown
    console.log(`\n📊 ${color('bright', 'Score Breakdown:')}`);
    console.log(`   Security:      ${formatScore(eval_.breakdown.security)} ${color('dim', '(OpenSSF Scorecard)')}`);
    console.log(`   Maintenance:   ${formatScore(eval_.breakdown.maintenance)} ${color('dim', '(Libraries.io)')}`);
    console.log(`   Popularity:    ${formatScore(eval_.breakdown.popularity)} ${color('dim', '(GitHub)')}`);
    console.log(`   Ecosystem:     ${formatScore(eval_.breakdown.ecosystem)} ${color('dim', '(Dependents)')}`);
    
    // Metadata
    if (data.metadata?.description) {
      console.log(`\n📝 ${color('bright', 'Description:')}`);
      console.log(`   ${data.metadata.description}`);
    }
    
    // Stats
    console.log(`\n📈 ${color('bright', 'Stats:')}`);
    if (data.sources.github?.stars) {
      console.log(`   ⭐ Stars: ${data.sources.github.stars.toLocaleString()}`);
    }
    if (data.sources.github?.forks) {
      console.log(`   🍴 Forks: ${data.sources.github.forks.toLocaleString()}`);
    }
    if (data.sources.libraries?.dependents) {
      console.log(`   📦 Dependents: ${data.sources.libraries.dependents.toLocaleString()}`);
    }
    if (data.sources.libraries?.rank) {
      console.log(`   🏆 Rank: #${data.sources.libraries.rank}`);
    }
    if (data.metadata?.license) {
      console.log(`   📄 License: ${data.metadata.license}`);
    }
    
    // Security checks
    if (data.sources.scorecard?.checks?.length > 0) {
      console.log(`\n🔒 ${color('bright', 'Security Checks (OpenSSF Scorecard):')}`);
      data.sources.scorecard.checks.forEach(check => {
        const icon = check.score >= 8 ? '✅' : check.score >= 5 ? '⚠️' : '❌';
        const scoreColor = check.score >= 8 ? 'green' : check.score >= 5 ? 'yellow' : 'red';
        console.log(`   ${icon} ${check.name}: ${color(scoreColor, `${check.score}/10`)}`);
        if (check.reason) {
          console.log(`      ${color('dim', check.reason)}`);
        }
      });
    }
    
    // Recommendation
    console.log(`\n💡 ${color('bright', 'Recommendation:')}`);
    if (eval_.composite >= 8) {
      console.log(color('green', '   ✅ ' + eval_.recommendation));
    } else if (eval_.composite >= 6) {
      console.log(color('yellow', '   ⚠️  ' + eval_.recommendation));
    } else {
      console.log(color('red', '   ❌ ' + eval_.recommendation));
    }
    
    // Links
    console.log(`\n🔗 ${color('bright', 'Links:')}`);
    if (data.metadata?.repository) {
      console.log(`   ${color('dim', 'Repository:')} ${data.metadata.repository}`);
    }
    if (data.metadata?.homepage) {
      console.log(`   ${color('dim', 'Homepage:')} ${data.metadata.homepage}`);
    }
    
    console.log();
    return 0;
    
  } catch (error) {
    console.error(color('red', `Error: ${error.message}`));
    return 1;
  }
}

async function auditCommand(args) {
  const packageJsonPath = resolve(args.path || 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    console.log(color('red', `Error: Cannot find package.json at ${packageJsonPath}`));
    console.log('Usage: modern audit [--path ./path/to/package.json]');
    return 1;
  }
  
  console.log(`📦 Auditing ${color('cyan', packageJsonPath)}...\n`);
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    const depNames = Object.keys(dependencies);
    
    if (depNames.length === 0) {
      console.log(color('yellow', 'No dependencies found in package.json'));
      return 0;
    }
    
    console.log(`Found ${color('bright', depNames.length)} dependencies. Evaluating...\n`);
    
    const results = [];
    const platform = 'npm'; // Assume npm for now
    
    // Evaluate each dependency
    for (let i = 0; i < depNames.length; i++) {
      const name = depNames[i];
      const version = dependencies[name];
      
      process.stdout.write(`[${i + 1}/${depNames.length}] ${name}... `);
      
      try {
        const data = await fetchAPI(`/tools/${platform}/${name}`);
        results.push({
          name,
          version,
          score: data.evaluation.composite,
          grade: data.evaluation.grade,
          recommendation: data.evaluation.recommendation
        });
        process.stdout.write(`${formatScore(data.evaluation.composite)}\n`);
      } catch (error) {
        results.push({
          name,
          version,
          score: null,
          grade: '?',
          error: error.message
        });
        process.stdout.write(color('red', 'ERROR\n'));
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(color('bright', 'AUDIT SUMMARY'));
    console.log('='.repeat(60));
    
    const evaluated = results.filter(r => r.score !== null);
    const averageScore = evaluated.reduce((sum, r) => sum + r.score, 0) / evaluated.length;
    
    console.log(`\n📊 Overall Score: ${formatScore(averageScore)}`);
    console.log(`📦 Dependencies Evaluated: ${evaluated.length}/${depNames.length}`);
    
    // Grade distribution
    const grades = { A: 0, B: 0, C: 0, D: 0, F: 0, '?': 0 };
    results.forEach(r => { grades[r.grade] = (grades[r.grade] || 0) + 1; });
    
    console.log(`\n🎓 Grade Distribution:`);
    Object.entries(grades)
      .filter(([_, count]) => count > 0)
      .forEach(([grade, count]) => {
        const colorName = grade === 'A' ? 'green' : grade === 'B' || grade === 'C' ? 'yellow' : 'red';
        console.log(`   ${formatGrade(grade)}: ${count} packages`);
      });
    
    // Issues
    const issues = results.filter(r => r.score !== null && r.score < 6);
    if (issues.length > 0) {
      console.log(`\n⚠️  ${color('yellow', 'Packages needing attention:')}`);
      issues.forEach(r => {
        console.log(`   ${color('red', '❌')} ${r.name}@${r.version}: ${formatScore(r.score)}`);
      });
    }
    
    // Top packages
    const topPackages = results
      .filter(r => r.score !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    console.log(`\n🏆 ${color('green', 'Top Packages:')}`);
    topPackages.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name}: ${formatScore(r.score)}`);
    });
    
    // Generate report if requested
    if (args.report || args.r) {
      await generateReport(results, packageJson);
    }
    
    console.log();
    return 0;
    
  } catch (error) {
    console.error(color('red', `Error: ${error.message}`));
    return 1;
  }
}

async function compareCommand(args) {
  const packages = args._.slice(1); // Remove 'compare' command
  
  if (packages.length < 2) {
    console.log(color('red', 'Error: Need at least 2 packages to compare'));
    console.log('Usage: modern compare <package1> <package2> [package3...]');
    console.log('Example: modern compare react vue angular');
    return 1;
  }
  
  console.log(`🔍 Comparing ${packages.length} packages...\n`);
  
  try {
    const tools = packages.map(pkg => {
      const [platform, name] = pkg.includes('/') ? pkg.split('/') : ['npm', pkg];
      return { platform, name };
    });
    
    const data = await fetchAPI('/compare', {
      method: 'POST',
      body: JSON.stringify({ tools })
    });
    
    console.log('='.repeat(70));
    console.log(color('bright', 'COMPARISON RESULTS'));
    console.log('='.repeat(70));
    
    // Table header
    console.log(`\n${color('bright', 'Rank  Package                    Score   Grade   Status')}`);
    console.log('-'.repeat(70));
    
    data.results.forEach((result, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
      const name = result.name.padEnd(26);
      
      if (result.error) {
        console.log(`${medal} ${rank.toString().padEnd(3)} ${name} ${color('red', 'ERROR')}`);
      } else {
        const score = formatScore(result.evaluation.composite);
        const grade = formatGrade(result.evaluation.grade);
        const status = result.evaluation.composite >= 8 
          ? color('green', '✅ Recommended')
          : result.evaluation.composite >= 6
            ? color('yellow', '⚠️  Consider alternatives')
            : color('red', '❌ Review carefully');
        
        console.log(`${medal} ${rank.toString().padEnd(3)} ${name} ${score} ${grade}      ${status}`);
      }
    });
    
    // Detailed breakdown
    console.log(`\n${color('bright', 'Detailed Breakdown:')}`);
    console.log('-'.repeat(70));
    
    data.results.forEach(result => {
      if (result.error) return;
      
      console.log(`\n${color('bright', result.name)}:`);
      console.log(`  Security:      ${formatScore(result.evaluation.breakdown.security)}`);
      console.log(`  Maintenance:   ${formatScore(result.evaluation.breakdown.maintenance)}`);
      console.log(`  Popularity:    ${formatScore(result.evaluation.breakdown.popularity)}`);
      console.log(`  Ecosystem:     ${formatScore(result.evaluation.breakdown.ecosystem)}`);
    });
    
    console.log();
    return 0;
    
  } catch (error) {
    console.error(color('red', `Error: ${error.message}`));
    return 1;
  }
}

async function reportCommand(args) {
  const packageJsonPath = resolve(args.path || 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    console.log(color('red', `Error: Cannot find package.json at ${packageJsonPath}`));
    return 1;
  }
  
  console.log(`📄 Generating report from ${color('cyan', packageJsonPath)}...\n`);
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    const depNames = Object.keys(dependencies);
    const results = [];
    
    for (const name of depNames) {
      try {
        const data = await fetchAPI(`/tools/npm/${name}`);
        results.push({
          name,
          version: dependencies[name],
          score: data.evaluation.composite,
          grade: data.evaluation.grade,
          recommendation: data.evaluation.recommendation,
          breakdown: data.evaluation.breakdown
        });
      } catch (error) {
        results.push({ name, version: dependencies[name], error: true });
      }
    }
    
    await generateReport(results, packageJson, args.output);
    return 0;
    
  } catch (error) {
    console.error(color('red', `Error: ${error.message}`));
    return 1;
  }
}

async function generateReport(results, packageJson, outputPath = 'TOOLS.md') {
  const evaluated = results.filter(r => !r.error);
  const averageScore = evaluated.reduce((sum, r) => sum + r.score, 0) / evaluated.length;
  
  const report = `# Project Analysis Report

Generated by Project Modern CLI
Date: ${new Date().toISOString().split('T')[0]}

## 📊 Summary

- **Project:** ${packageJson.name || 'Unnamed Project'}
- **Overall Score:** ${averageScore.toFixed(1)}/10
- **Dependencies Evaluated:** ${evaluated.length}/${results.length}

## 🎓 Grade Distribution

| Grade | Count |
|-------|-------|
${['A', 'B', 'C', 'D', 'F'].map(grade => {
  const count = evaluated.filter(r => r.grade === grade).length;
  return `| ${grade} | ${count} |`;
}).join('\n')}

## 📦 Dependencies

| Package | Version | Score | Grade | Status |
|---------|---------|-------|-------|--------|
${evaluated.map(r => {
  const status = r.score >= 8 ? '✅' : r.score >= 6 ? '⚠️' : '❌';
  return `| ${r.name} | ${r.version} | ${r.score.toFixed(1)} | ${r.grade} | ${status} |`;
}).join('\n')}

## ⚠️ Packages Needing Attention

${evaluated.filter(r => r.score < 6).map(r => `- **${r.name}** (${r.score.toFixed(1)}/10): ${r.recommendation}`).join('\n') || '*None - all packages score above 6.0*'}

## 🏆 Top Packages

${evaluated.sort((a, b) => b.score - a.score).slice(0, 5).map((r, i) => `${i + 1}. **${r.name}** - ${r.score.toFixed(1)}/10`).join('\n')}

---

*This report was generated by Project Modern. For more details, visit http://localhost:3000*
`;

  writeFileSync(outputPath, report);
  console.log(color('green', `✅ Report saved to ${outputPath}`));
}

function helpCommand() {
  console.log(`
${color('bright', 'Project Modern CLI')}

${color('dim', 'A command-line tool for discovering and evaluating open source packages.')}

${color('bright', 'Usage:')}
  modern <command> [options]

${color('bright', 'Commands:')}
  ${color('cyan', 'search')} <package>       Search and evaluate a package
  ${color('cyan', 'audit')}                 Audit current project dependencies
  ${color('cyan', 'compare')} <pkg1> <pkg2>  Compare multiple packages
  ${color('cyan', 'report')}                 Generate TOOLS.md report
  ${color('cyan', 'help')}                   Show this help message

${color('bright', 'Options:')}
  -p, --platform <platform>  Package platform (npm, pypi, maven) [default: npm]
  --path <path>              Path to package.json [default: ./package.json]
  -r, --report               Generate report after audit
  -o, --output <file>        Output file for report [default: TOOLS.md]

${color('bright', 'Examples:')}
  modern search react
  modern search lodash --platform npm
  modern audit
  modern audit --report
  modern compare react vue angular
  modern report --output REPORT.md

${color('bright', 'Environment Variables:')}
  MODERN_API_URL            API endpoint [default: http://localhost:3000]
`);
  return 0;
}

// ============================================================================
// MAIN
// ============================================================================

function parseArgs(argv) {
  const args = { _: [] };
  
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = argv[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const nextArg = argv[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(arg);
    }
  }
  
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const command = args._[0] || 'help';
  
  switch (command) {
    case 'search':
      return await searchCommand(args);
    case 'audit':
      return await auditCommand(args);
    case 'compare':
      return await compareCommand(args);
    case 'report':
      return await reportCommand(args);
    case 'help':
    case '--help':
    case '-h':
      return helpCommand();
    default:
      console.log(color('red', `Unknown command: ${command}`));
      console.log('Run "modern help" for usage information.');
      return 1;
  }
}

main().then(code => process.exit(code));
