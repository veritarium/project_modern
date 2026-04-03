import * as vscode from 'vscode';
import { ProjectModernAPI } from './api';
import { PackageTreeProvider } from './providers/treeProvider';

export function registerCommands(
  api: ProjectModernAPI,
  treeProvider: PackageTreeProvider,
  outputChannel: vscode.OutputChannel
): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  // Search command
  commands.push(
    vscode.commands.registerCommand('projectModern.search', async () => {
      const packageName = await vscode.window.showInputBox({
        prompt: 'Enter package name to evaluate',
        placeHolder: 'e.g., react, lodash, express'
      });

      if (!packageName) return;

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Evaluating ${packageName}...`
      }, async () => {
        try {
          const data = await api.evaluateTool('npm', packageName);
          
          if (!data) {
            vscode.window.showWarningMessage(`Package "${packageName}" not found`);
            return;
          }

          showPackageDetails(data);
        } catch (error) {
          vscode.window.showErrorMessage(`Error: ${error}`);
        }
      });
    })
  );

  // Evaluate project command
  commands.push(
    vscode.commands.registerCommand('projectModern.evaluateProject', async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showWarningMessage('No workspace open');
        return;
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Evaluating project dependencies...'
      }, async (progress) => {
        try {
          const results = [];
          
          for (const folder of workspaceFolders) {
            const packageJson = require(require('path').join(folder.uri.fsPath, 'package.json'));
            const deps = {
              ...packageJson.dependencies,
              ...packageJson.devDependencies
            };

            const depNames = Object.keys(deps);
            let evaluated = 0;

            for (const name of depNames) {
              progress.report({ 
                increment: 100 / depNames.length,
                message: `(${++evaluated}/${depNames.length}) ${name}`
              });

              try {
                const data = await api.evaluateTool('npm', name);
                if (data) {
                  results.push(data);
                }
              } catch (error) {
                // Skip failed evaluations
              }
            }
          }

          showProjectSummary(results);
        } catch (error) {
          vscode.window.showErrorMessage(`Error: ${error}`);
        }
      });
    })
  );

  // Refresh command
  commands.push(
    vscode.commands.registerCommand('projectModern.refresh', () => {
      treeProvider.refresh();
      vscode.window.showInformationMessage('Project Modern: Refreshed evaluations');
    })
  );

  // Compare command
  commands.push(
    vscode.commands.registerCommand('projectModern.compare', async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter packages to compare (comma-separated)',
        placeHolder: 'e.g., react, vue, angular'
      });

      if (!input) return;

      const packages = input.split(',').map(p => p.trim()).filter(p => p);
      
      if (packages.length < 2) {
        vscode.window.showWarningMessage('Please enter at least 2 packages to compare');
        return;
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Comparing packages...'
      }, async () => {
        try {
          const tools = packages.map(name => ({ platform: 'npm', name }));
          const data = await api.compareTools(tools);
          
          showComparison(data);
        } catch (error) {
          vscode.window.showErrorMessage(`Error: ${error}`);
        }
      });
    })
  );

  // Open dashboard command
  commands.push(
    vscode.commands.registerCommand('projectModern.openDashboard', () => {
      const config = vscode.workspace.getConfiguration('projectModern');
      const apiUrl = config.get('apiUrl') as string;
      
      // Open the demo HTML file or API docs
      vscode.env.openExternal(vscode.Uri.parse(`${apiUrl}/tools/popular`));
    })
  );

  // Show package details command
  commands.push(
    vscode.commands.registerCommand('projectModern.showPackageDetails', (data) => {
      showPackageDetails(data);
    })
  );

  return commands;
}

function showPackageDetails(data: any) {
  const eval_ = data.evaluation;
  
  const panel = vscode.window.createWebviewPanel(
    'projectModern.packageDetails',
    `${data.name} - Project Modern`,
    vscode.ViewColumn.One,
    {}
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          color: #e2e8f0;
          background: #0f172a;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .score {
          font-size: 48px;
          font-weight: bold;
          margin: 20px 0;
        }
        .score.high { color: #22c55e; }
        .score.medium { color: #eab308; }
        .score.low { color: #ef4444; }
        .grade {
          font-size: 24px;
          color: #94a3b8;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 30px 0;
        }
        .metric {
          background: #1e293b;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #334155;
        }
        .metric-label {
          color: #94a3b8;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: 600;
        }
        .metric-value.high { color: #22c55e; }
        .metric-value.medium { color: #eab308; }
        .metric-value.low { color: #ef4444; }
        .recommendation {
          background: #1e293b;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          margin-top: 20px;
        }
        .links {
          margin-top: 20px;
        }
        .links a {
          color: #3b82f6;
          margin-right: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📦 ${data.name}</h1>
        <div class="score ${eval_.composite >= 8 ? 'high' : eval_.composite >= 6 ? 'medium' : 'low'}">
          ${eval_.composite.toFixed(1)}/10
        </div>
        <div class="grade">Grade: ${eval_.grade}</div>
      </div>

      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Security</div>
          <div class="metric-value ${eval_.breakdown.security >= 8 ? 'high' : eval_.breakdown.security >= 6 ? 'medium' : 'low'}">
            ${eval_.breakdown.security.toFixed(1)}
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">Maintenance</div>
          <div class="metric-value ${eval_.breakdown.maintenance >= 8 ? 'high' : eval_.breakdown.maintenance >= 6 ? 'medium' : 'low'}">
            ${eval_.breakdown.maintenance.toFixed(1)}
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">Popularity</div>
          <div class="metric-value ${eval_.breakdown.popularity >= 8 ? 'high' : eval_.breakdown.popularity >= 6 ? 'medium' : 'low'}">
            ${eval_.breakdown.popularity.toFixed(1)}
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">Ecosystem</div>
          <div class="metric-value ${eval_.breakdown.ecosystem >= 8 ? 'high' : eval_.breakdown.ecosystem >= 6 ? 'medium' : 'low'}">
            ${eval_.breakdown.ecosystem.toFixed(1)}
          </div>
        </div>
      </div>

      <div class="recommendation">
        <strong>💡 Recommendation:</strong> ${eval_.recommendation}
      </div>

      ${data.metadata?.description ? `<p style="margin-top: 20px; color: #94a3b8;">${data.metadata.description}</p>` : ''}

      <div class="links">
        ${data.metadata?.repository ? `<a href="${data.metadata.repository}">Repository</a>` : ''}
        ${data.metadata?.homepage ? `<a href="${data.metadata.homepage}">Homepage</a>` : ''}
      </div>
    </body>
    </html>
  `;
}

function showProjectSummary(results: any[]) {
  if (results.length === 0) {
    vscode.window.showInformationMessage('No dependencies to evaluate');
    return;
  }

  const averageScore = results.reduce((sum, r) => sum + r.evaluation.composite, 0) / results.length;
  const sorted = results.sort((a, b) => b.evaluation.composite - a.evaluation.composite);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5);

  const panel = vscode.window.createWebviewPanel(
    'projectModern.projectSummary',
    'Project Summary - Project Modern',
    vscode.ViewColumn.One,
    {}
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          color: #e2e8f0;
          background: #0f172a;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .score {
          font-size: 48px;
          font-weight: bold;
          margin: 20px 0;
        }
        .score.high { color: #22c55e; }
        .score.medium { color: #eab308; }
        .score.low { color: #ef4444; }
        .section {
          margin: 30px 0;
        }
        .section h2 {
          border-bottom: 1px solid #334155;
          padding-bottom: 10px;
        }
        .package-list {
          list-style: none;
          padding: 0;
        }
        .package-list li {
          background: #1e293b;
          padding: 10px 15px;
          margin: 5px 0;
          border-radius: 5px;
          display: flex;
          justify-content: space-between;
        }
        .package-name {
          font-weight: 500;
        }
        .package-score {
          font-weight: bold;
        }
        .package-score.high { color: #22c55e; }
        .package-score.medium { color: #eab308; }
        .package-score.low { color: #ef4444; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📦 Project Summary</h1>
        <div class="score ${averageScore >= 8 ? 'high' : averageScore >= 6 ? 'medium' : 'low'}">
          ${averageScore.toFixed(1)}/10
        </div>
        <div style="color: #94a3b8;">${results.length} dependencies evaluated</div>
      </div>

      <div class="section">
        <h2>🏆 Top 5 Packages</h2>
        <ul class="package-list">
          ${top5.map((r, i) => `
            <li>
              <span class="package-name">${i + 1}. ${r.name}</span>
              <span class="package-score ${r.evaluation.composite >= 8 ? 'high' : r.evaluation.composite >= 6 ? 'medium' : 'low'}">
                ${r.evaluation.composite.toFixed(1)}
              </span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>⚠️ Needs Attention</h2>
        <ul class="package-list">
          ${bottom5.map((r, i) => `
            <li>
              <span class="package-name">${r.name}</span>
              <span class="package-score low">${r.evaluation.composite.toFixed(1)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </body>
    </html>
  `;
}

function showComparison(data: any) {
  const panel = vscode.window.createWebviewPanel(
    'projectModern.comparison',
    'Package Comparison - Project Modern',
    vscode.ViewColumn.One,
    {}
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          color: #e2e8f0;
          background: #0f172a;
        }
        h1 {
          text-align: center;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #334155;
        }
        th {
          color: #94a3b8;
          font-weight: 500;
        }
        .rank {
          font-size: 24px;
          font-weight: bold;
        }
        .rank-1 { color: #ffd700; }
        .rank-2 { color: #c0c0c0; }
        .rank-3 { color: #cd7f32; }
        .score {
          font-weight: bold;
        }
        .score.high { color: #22c55e; }
        .score.medium { color: #eab308; }
        .score.low { color: #ef4444; }
      </style>
    </head>
    <body>
      <h1>🔍 Package Comparison</h1>
      
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Package</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Security</th>
            <th>Maintenance</th>
            <th>Popularity</th>
          </tr>
        </thead>
        <tbody>
          ${data.results.map((r: any, i: number) => `
            <tr>
              <td class="rank rank-${i + 1}">${i + 1}</td>
              <td><strong>${r.name}</strong></td>
              <td class="score ${r.evaluation.composite >= 8 ? 'high' : r.evaluation.composite >= 6 ? 'medium' : 'low'}">
                ${r.evaluation.composite.toFixed(1)}
              </td>
              <td>${r.evaluation.grade}</td>
              <td>${r.evaluation.breakdown.security.toFixed(1)}</td>
              <td>${r.evaluation.breakdown.maintenance.toFixed(1)}</td>
              <td>${r.evaluation.breakdown.popularity.toFixed(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}
