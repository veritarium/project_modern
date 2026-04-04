'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/search-form';
import { ScoreDisplay, ScoreBreakdown } from '@/components/score-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { evaluateTool } from '@/lib/api';
import { formatScore, getScoreColor } from '@/lib/utils';
import type { ToolEvaluationResponse } from '@projectmodern/types';
import { AlertCircle, CheckCircle, Github, Package, Star } from 'lucide-react';

export default function Home() {
  const [result, setResult] = useState<ToolEvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (platform: string, name: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await evaluateTool(platform, name);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate tool');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Project Modern</h1>
        <p className="text-lg text-muted-foreground">
          Evaluate open source packages with intelligent scoring
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-8">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Tool Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{result.tool.name}</h2>
              <p className="text-muted-foreground">
                {result.tool.platform} • {result.tool.description}
              </p>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(result.tool.score.overall)}`}>
              {formatScore(result.tool.score.overall)}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreDisplay score={result.tool.score} />
                <ScoreBreakdown breakdown={result.tool.score.breakdown} />
              </div>

              {/* Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{result.tool.score.recommendation}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreBreakdown breakdown={result.tool.score.breakdown} />

                {/* Detailed Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.tool.sources.github && (
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          {result.tool.sources.github.stargazersCount.toLocaleString()} stars
                        </span>
                      </div>
                    )}
                    {result.tool.sources.librariesIo && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          {result.tool.sources.librariesIo.dependentPackagesCount.toLocaleString()}{' '}
                          dependents
                        </span>
                      </div>
                    )}
                    {result.tool.metadata.license && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          {result.tool.metadata.license} license
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sources">
              <div className="grid grid-cols-1 gap-4">
                {/* Scorecard */}
                {result.tool.sources.scorecard && (
                  <Card>
                    <CardHeader>
                      <CardTitle>OpenSSF Scorecard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold">
                          {result.tool.sources.scorecard.score.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">/ 10</span>
                      </div>
                      <div className="space-y-2">
                        {result.tool.sources.scorecard.checks.slice(0, 5).map((check) => (
                          <div
                            key={check.name}
                            className="flex items-center justify-between p-2 rounded bg-muted"
                          >
                            <span className="text-sm">{check.name}</span>
                            <span className={`text-sm font-medium ${getScoreColor(check.score)}`}>
                              {check.score}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* GitHub */}
                {result.tool.sources.github && (
                  <Card>
                    <CardHeader>
                      <CardTitle>GitHub</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>
                          {result.tool.sources.github.stargazersCount.toLocaleString()} stars
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Forks:</span>
                        <span>{result.tool.sources.github.forksCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Open Issues:</span>
                        <span>{result.tool.sources.github.openIssuesCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Language:</span>
                        <span>{result.tool.sources.github.language}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Libraries.io */}
                {result.tool.sources.librariesIo && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Libraries.io</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Rank:</span>
                        <span>#{result.tool.sources.librariesIo.rank}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Dependent Repos:</span>
                        <span>
                          {result.tool.sources.librariesIo.dependentReposCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Dependent Packages:</span>
                        <span>
                          {result.tool.sources.librariesIo.dependentPackagesCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <span>{result.tool.sources.librariesIo.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </main>
  );
}
