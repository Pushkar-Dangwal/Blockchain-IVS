import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { BarChart3, TrendingUp, Clock, Shield, Activity, RefreshCw } from 'lucide-react';
import { useIVSContract } from '../hooks/useIVSContract';
import type { IdentityScore, ScoreBreakdown } from '../types/ivs';

interface IdentityScorePanelProps {
  contract: Contract;
  uniqueId?: string;
  onUpdate?: () => void;
}

export default function IdentityScorePanel({ contract, uniqueId, onUpdate }: IdentityScorePanelProps) {
  const [score, setScore] = useState<IdentityScore | null>(null);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);
  
  const { 
    loading, 
    getScore, 
    calculateScore,
    recordVerificationActivity,
    recordTransaction 
  } = useIVSContract(contract);

  useEffect(() => {
    if (uniqueId) {
      loadScore();
    }
  }, [uniqueId]);

  const loadScore = async () => {
    if (!uniqueId) return;
    
    try {
      const scoreData = await getScore(uniqueId);
      if (scoreData) {
        setScore(scoreData);
        calculateBreakdown(scoreData);
        setLastCalculated(new Date());
      }
    } catch (error) {
      console.error('Error loading score:', error);
    }
  };

  const calculateBreakdown = (scoreData: IdentityScore) => {
    // Convert BigInt to numbers for calculations
    const usage = Number(scoreData.usageFrequency) * 25; // 25% weight
    const reliability = Number(scoreData.issuerReliability) * 30; // 30% weight  
    const transparency = Number(scoreData.transparencyScore) * 15; // 15% weight
    
    // Calculate recency bonus (30 points recent, 10 points stale)
    const now = Math.floor(Date.now() / 1000);
    const lastVerification = Number(scoreData.lastVerification);
    const daysSinceVerification = (now - lastVerification) / (24 * 60 * 60);
    const recency = daysSinceVerification <= 30 ? 30 : 10;
    
    const total = usage + reliability + transparency + recency;
    
    setBreakdown({
      usage,
      reliability, 
      transparency,
      recency,
      total
    });
  };

  const handleCalculateScore = async () => {
    try {
      await calculateScore();
      await recordTransaction('SCORE_CALCULATION');
      await loadScore();
      onUpdate?.(); // Trigger refresh
    } catch (error) {
      console.error('Error calculating score:', error);
    }
  };

  const handleRecordActivity = async () => {
    try {
      await recordVerificationActivity();
      await recordTransaction('VERIFICATION_ACTIVITY');
      await loadScore();
      onUpdate?.(); // Trigger refresh
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-600">Good</Badge>;
    if (score >= 40) return <Badge className="bg-orange-600">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === 0n) return 'Never';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  if (!uniqueId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Identity Score
          </CardTitle>
          <CardDescription>
            You need to be authorized to view your identity score
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Identity Score
          </CardTitle>
          <CardDescription>
            Your current identity verification score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {score && breakdown ? (
            <>
              <div className="text-center space-y-2">
                <div className={`text-4xl font-bold ${getScoreColor(breakdown.total)}`}>
                  {breakdown.total}
                </div>
                <div className="flex justify-center">
                  {getScoreBadge(breakdown.total)}
                </div>
                <Progress value={Math.min(breakdown.total, 100)} className="w-full" />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Usage Frequency (25%)</span>
                  <span className="text-sm">{breakdown.usage} pts</span>
                </div>
                <Progress value={(breakdown.usage / 25) * 100} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Issuer Reliability (30%)</span>
                  <span className="text-sm">{breakdown.reliability} pts</span>
                </div>
                <Progress value={(breakdown.reliability / 30) * 100} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Transparency (15%)</span>
                  <span className="text-sm">{breakdown.transparency} pts</span>
                </div>
                <Progress value={(breakdown.transparency / 15) * 100} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Recency Bonus</span>
                  <span className="text-sm">{breakdown.recency} pts</span>
                </div>
                <Progress value={(breakdown.recency / 30) * 100} className="h-2" />
              </div>

              {lastCalculated && (
                <div className="text-xs text-muted-foreground text-center">
                  Last updated: {lastCalculated.toLocaleString()}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No score data available</p>
              <p className="text-xs text-muted-foreground mt-2">
                Calculate your score to see detailed breakdown
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Score Management</CardTitle>
          <CardDescription>
            Actions to improve and update your identity score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleCalculateScore}
            disabled={loading}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Calculate Score
          </Button>

          <Button 
            onClick={handleRecordActivity}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <Activity className="w-4 h-4 mr-2" />
            Record Verification Activity
          </Button>

          <Separator />

          {score && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Usage Count
                </span>
                <span>{Number(score.usageFrequency)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Reliability Score
                </span>
                <span>{Number(score.issuerReliability)}/10</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Transparency Score
                </span>
                <span>{Number(score.transparencyScore)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last Verification
                </span>
                <span className="text-xs">{formatTimestamp(score.lastVerification)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}