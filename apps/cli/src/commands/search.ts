/**
 * Search Command
 */

import type { ProjectModernClient } from '@projectmodern/api-client';
import type { Tool, PackagePlatform } from '@projectmodern/types';
import { formatScore, formatGrade, printHeader, printError } from '../utils.js';
import pc from 'picocolors';

interface SearchOptions {
  platform?: string;
}

export async function searchCommand(
  client: ProjectModernClient,
  packageName: string,
  options: SearchOptions
): Promise<number> {
  const platform = options.platform || 'npm';

  if (!packageName) {
    printError('Package name required');
    console.log('Usage: modern search <package> [--platform npm|pypi|maven]');
    return 1;
  }

  console.log(`🔍 Evaluating ${pc.cyan(`${platform}/${packageName}`)}...\n`);

  try {
    const response = await client.evaluateTool(platform as PackagePlatform, packageName);
    const data: Tool = response.tool;

    // Header
    printHeader(`📦 ${pc.bold(data.name)} ${pc.dim(`(${data.platform})`)}`);

    // Score
    const eval_ = data.score ?? {
      overall: 0,
      grade: 'F',
      breakdown: { security: 0, maintenance: 0, popularity: 0, ecosystem: 0 },
      recommendation: '',
      confidence: 0,
    };
    console.log(
      `\n🏆 ${pc.bold('Project Modern Score:')} ${formatScore(eval_.overall)} ${pc.dim(`(${formatGrade(eval_.grade)})`)}`
    );

    // Breakdown
    console.log(`\n📊 ${pc.bold('Score Breakdown:')}`);
    console.log(
      `   Security:      ${formatScore(eval_.breakdown.security)} ${pc.dim('(OpenSSF Scorecard)')}`
    );
    console.log(
      `   Maintenance:   ${formatScore(eval_.breakdown.maintenance)} ${pc.dim('(Libraries.io)')}`
    );
    console.log(
      `   Popularity:    ${formatScore(eval_.breakdown.popularity)} ${pc.dim('(GitHub)')}`
    );
    console.log(
      `   Ecosystem:     ${formatScore(eval_.breakdown.ecosystem)} ${pc.dim('(Dependents)')}`
    );

    // Metadata
    if (data.description) {
      console.log(`\n📝 ${pc.bold('Description:')}`);
      console.log(`   ${data.description}`);
    }

    // Stats
    console.log(`\n📈 ${pc.bold('Stats:')}`);
    if (data.sources?.github?.stargazersCount) {
      console.log(`   ⭐ Stars: ${data.sources.github.stargazersCount.toLocaleString()}`);
    }
    if (data.sources?.github?.forksCount) {
      console.log(`   🍴 Forks: ${data.sources.github.forksCount.toLocaleString()}`);
    }
    if (data.sources?.librariesIo?.dependentPackagesCount) {
      console.log(
        `   📦 Dependents: ${data.sources.librariesIo.dependentPackagesCount.toLocaleString()}`
      );
    }
    if (data.sources?.librariesIo?.rank) {
      console.log(`   🏆 Rank: #${data.sources.librariesIo.rank}`);
    }
    if (data.metadata?.license) {
      console.log(`   📄 License: ${data.metadata.license}`);
    }

    // Security checks
    if (data.sources?.scorecard?.checks && data.sources.scorecard.checks.length > 0) {
      console.log(`\n🔒 ${pc.bold('Security Checks (OpenSSF Scorecard):')}`);
      for (const check of data.sources.scorecard.checks.slice(0, 5)) {
        const icon = check.score >= 8 ? '✅' : check.score >= 5 ? '⚠️' : '❌';
        const scoreColor = check.score >= 8 ? pc.green : check.score >= 5 ? pc.yellow : pc.red;
        console.log(`   ${icon} ${check.name}: ${scoreColor(`${check.score}/10`)}`);
        if (check.reason) {
          console.log(`      ${pc.dim(check.reason)}`);
        }
      }
    }

    // Recommendation
    console.log(`\n💡 ${pc.bold('Recommendation:')}`);
    const overall = eval_.overall ?? 0;
    if (overall >= 8) {
      console.log(pc.green('   ✅ ' + eval_.recommendation));
    } else if (overall >= 6) {
      console.log(pc.yellow('   ⚠️  ' + eval_.recommendation));
    } else {
      console.log(pc.red('   ❌ ' + eval_.recommendation));
    }

    // Links
    console.log(`\n🔗 ${pc.bold('Links:')}`);
    if (data.metadata?.repository) {
      console.log(`   ${pc.dim('Repository:')} ${data.metadata.repository}`);
    }
    if (data.metadata?.homepage) {
      console.log(`   ${pc.dim('Homepage:')} ${data.metadata.homepage}`);
    }

    console.log();
    return 0;
  } catch (error) {
    printError(error instanceof Error ? error.message : 'Unknown error');
    return 1;
  }
}
