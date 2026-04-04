/**
 * Compare Command
 */

import type { ProjectModernClient } from '@projectmodern/api-client';
import { formatScore, formatGrade, printHeader, printError } from '../utils.js';
import pc from 'picocolors';

export async function compareCommand(
  client: ProjectModernClient,
  packages: string[]
): Promise<number> {
  if (packages.length < 2) {
    printError('Need at least 2 packages to compare');
    console.log('Usage: modern compare <package1> <package2> [package3...]');
    console.log('Example: modern compare react vue angular');
    return 1;
  }

  console.log(`🔍 Comparing ${packages.length} packages...\n`);

  try {
    const tools = packages
      .map((pkg) => {
        const [platform, name] = pkg.includes('/') ? pkg.split('/') : ['npm', pkg];
        return {
          platform: platform as 'npm' | 'pypi' | 'maven' | 'go' | 'rust' | 'nuget',
          name: name!,
        };
      })
      .filter((t) => t.name);

    const data = await client.compareTools(tools);

    printHeader('COMPARISON RESULTS');

    // Table header
    console.log(`\n${pc.bold('Rank  Package                    Score   Grade   Status')}`);
    console.log('-'.repeat(70));

    for (let i = 0; i < data.results.length; i++) {
      const result = data.results[i];
      if (!result) continue;

      const rank = i + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
      const name = result.name.padEnd(26);
      const score = result.score;
      const grade = score?.grade;
      const composite = score?.overall ?? 0;

      const scoreStr = formatScore(composite);
      const gradeStr = formatGrade(grade);
      const status =
        composite >= 8
          ? pc.green('✅ Recommended')
          : composite >= 6
            ? pc.yellow('⚠️  Consider alternatives')
            : pc.red('❌ Review carefully');

      console.log(
        `${medal} ${rank.toString().padEnd(3)} ${name} ${scoreStr} ${gradeStr}      ${status}`
      );
    }

    // Detailed breakdown
    console.log(`\n${pc.bold('Detailed Breakdown:')}`);
    console.log('-'.repeat(70));

    for (const result of data.results) {
      if (!result.score) continue;

      console.log(`\n${pc.bold(result.name)}:`);
      console.log(`  Security:      ${formatScore(result.score.breakdown.security)}`);
      console.log(`  Maintenance:   ${formatScore(result.score.breakdown.maintenance)}`);
      console.log(`  Popularity:    ${formatScore(result.score.breakdown.popularity)}`);
      console.log(`  Ecosystem:     ${formatScore(result.score.breakdown.ecosystem)}`);
    }

    console.log();
    return 0;
  } catch (error) {
    printError(error instanceof Error ? error.message : 'Unknown error');
    return 1;
  }
}
