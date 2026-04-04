import * as vscode from 'vscode';
import * as path from 'node:path';
import type { ProjectModernAPI, ToolData } from '../api';

export class PackageTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly packageData?: ToolData,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    if (packageData) {
      const score = packageData.evaluation.composite;
      const icon = score >= 8 ? '$(check)' : score >= 6 ? '$(warning)' : '$(error)';

      this.description = `${icon} ${score.toFixed(1)}/10 (${packageData.evaluation.grade})`;
      this.tooltip = `${packageData.name}: ${packageData.evaluation.recommendation}`;

      // Set icon based on score
      if (score >= 8) {
        this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
      } else if (score >= 6) {
        this.iconPath = new vscode.ThemeIcon(
          'warning',
          new vscode.ThemeColor('testing.iconQueued')
        );
      } else {
        this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
      }

      // Context value for menu items
      this.contextValue = 'package';
    }
  }
}

export class PackageTreeProvider implements vscode.TreeDataProvider<PackageTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    PackageTreeItem | undefined | null | undefined
  > = new vscode.EventEmitter<PackageTreeItem | undefined | null | undefined>();
  readonly onDidChangeTreeData: vscode.Event<PackageTreeItem | undefined | null | undefined> =
    this._onDidChangeTreeData.event;

  private packageData: Map<string, ToolData> = new Map();

  constructor(private api: ProjectModernAPI) {}

  refresh(): void {
    this.loadPackageData();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: PackageTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: PackageTreeItem): Promise<PackageTreeItem[]> {
    if (element) {
      // Return details for a specific package
      if (element.packageData) {
        return this.getPackageDetails(element.packageData);
      }
      return [];
    }

    // Return root items (packages)
    return this.getRootItems();
  }

  private async getRootItems(): Promise<PackageTreeItem[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return [new PackageTreeItem('No workspace open', vscode.TreeItemCollapsibleState.None)];
    }

    const items: PackageTreeItem[] = [];

    for (const folder of workspaceFolders) {
      const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');

      try {
        const packageJson = require(packageJsonPath);
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        // Summary item
        const depCount = Object.keys(allDeps).length;
        items.push(
          new PackageTreeItem(
            `${folder.name} (${depCount} dependencies)`,
            vscode.TreeItemCollapsibleState.Expanded
          )
        );

        // Sort by score (if we have data)
        const depNames = Object.keys(allDeps);

        // Load data for all packages
        await this.loadPackageDataForFolder(depNames);

        // Create items for each package
        const sortedDeps = depNames
          .map((name) => ({
            name,
            data: this.packageData.get(name),
          }))
          .sort((a, b) => {
            const scoreA = a.data?.evaluation.composite || 0;
            const scoreB = b.data?.evaluation.composite || 0;
            return scoreB - scoreA;
          });

        for (const { name, data } of sortedDeps.slice(0, 20)) {
          // Limit to top 20
          if (data) {
            items.push(
              new PackageTreeItem(name, vscode.TreeItemCollapsibleState.Collapsed, data, {
                command: 'projectModern.showPackageDetails',
                title: 'Show Details',
                arguments: [data],
              })
            );
          } else {
            items.push(new PackageTreeItem(name, vscode.TreeItemCollapsibleState.None));
          }
        }

        if (depNames.length > 20) {
          items.push(
            new PackageTreeItem(
              `... and ${depNames.length - 20} more`,
              vscode.TreeItemCollapsibleState.None
            )
          );
        }
      } catch (_error) {
        items.push(
          new PackageTreeItem(
            `${folder.name} (no package.json)`,
            vscode.TreeItemCollapsibleState.None
          )
        );
      }
    }

    return items;
  }

  private getPackageDetails(data: ToolData): PackageTreeItem[] {
    const items: PackageTreeItem[] = [];
    const eval_ = data.evaluation;

    // Score breakdown
    items.push(
      new PackageTreeItem(
        `Security: ${eval_.breakdown.security.toFixed(1)}/10`,
        vscode.TreeItemCollapsibleState.None
      )
    );
    items.push(
      new PackageTreeItem(
        `Maintenance: ${eval_.breakdown.maintenance.toFixed(1)}/10`,
        vscode.TreeItemCollapsibleState.None
      )
    );
    items.push(
      new PackageTreeItem(
        `Popularity: ${eval_.breakdown.popularity.toFixed(1)}/10`,
        vscode.TreeItemCollapsibleState.None
      )
    );
    items.push(
      new PackageTreeItem(
        `Ecosystem: ${eval_.breakdown.ecosystem.toFixed(1)}/10`,
        vscode.TreeItemCollapsibleState.None
      )
    );

    // Stats
    if (data.sources.github?.stars) {
      items.push(
        new PackageTreeItem(
          `⭐ ${data.sources.github.stars.toLocaleString()} stars`,
          vscode.TreeItemCollapsibleState.None
        )
      );
    }
    if (data.sources.libraries?.dependents) {
      items.push(
        new PackageTreeItem(
          `📦 ${data.sources.libraries.dependents.toLocaleString()} dependents`,
          vscode.TreeItemCollapsibleState.None
        )
      );
    }

    // Recommendation
    items.push(new PackageTreeItem(eval_.recommendation, vscode.TreeItemCollapsibleState.None));

    return items;
  }

  private async loadPackageData(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    for (const folder of workspaceFolders) {
      try {
        const packageJson = require(path.join(folder.uri.fsPath, 'package.json'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };
        await this.loadPackageDataForFolder(Object.keys(allDeps));
      } catch (_error) {
        // Ignore
      }
    }
  }

  private async loadPackageDataForFolder(depNames: string[]): Promise<void> {
    // Load data for packages we don't have yet (limit concurrent requests)
    const batchSize = 5;
    for (let i = 0; i < depNames.length; i += batchSize) {
      const batch = depNames.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (name) => {
          if (!this.packageData.has(name)) {
            try {
              const data = await this.api.evaluateTool('npm', name);
              if (data) {
                this.packageData.set(name, data);
              }
            } catch (_error) {
              // Ignore errors for individual packages
            }
          }
        })
      );
    }
  }
}
