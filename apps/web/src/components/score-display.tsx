'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatScore, getScoreColor, getScoreBgColor, getGradeColor } from '@/lib/utils';
import type { CompositeScore } from '@projectmodern/types';

interface ScoreDisplayProps {
  score: CompositeScore;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <Card className={`${getScoreBgColor(score.overall)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Overall Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-bold ${getScoreColor(score.overall)}`}>
            {score.overall.toFixed(1)}
          </span>
          <span className="text-xl text-muted-foreground">/ 10</span>
          <span className={`text-2xl font-semibold ml-2 ${getGradeColor(score.grade)}`}>
            {score.grade}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{score.recommendation}</p>
      </CardContent>
    </Card>
  );
}

interface ScoreBreakdownProps {
  breakdown: {
    security: number;
    maintenance: number;
    popularity: number;
    ecosystem: number;
  };
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const scores = [
    { label: 'Security', value: breakdown.security, weight: '30%' },
    { label: 'Maintenance', value: breakdown.maintenance, weight: '25%' },
    { label: 'Popularity', value: breakdown.popularity, weight: '25%' },
    { label: 'Ecosystem', value: breakdown.ecosystem, weight: '20%' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scores.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {item.label} <span className="text-muted-foreground">({item.weight})</span>
              </span>
              <span className={getScoreColor(item.value)}>{formatScore(item.value)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={`h-2 rounded-full transition-all ${
                  item.value >= 8
                    ? 'bg-green-500'
                    : item.value >= 6
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${(item.value / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
