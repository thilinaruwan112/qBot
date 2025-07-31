"use client";

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BetLogEntry } from '@/lib/types';
import { ListChecks } from 'lucide-react';
import { Label } from '../ui/label';

type BettingLogCardProps = {
  betLog: BetLogEntry[];
  setBetLog: React.Dispatch<React.SetStateAction<BetLogEntry[]>>;
};

export default function BettingLogCard({ betLog, setBetLog }: BettingLogCardProps) {
  const [commonStake, setCommonStake] = useState<number>(0);

  const handleCommonStakeChange = (value: string) => {
    const stakeValue = parseFloat(value) || 0;
    setCommonStake(stakeValue);
    const newBetLog = betLog.map(bet => ({ ...bet, stake: stakeValue }));
    setBetLog(newBetLog);
  };

  const handleActualOddChange = (id: number, value: string) => {
    const newBetLog = [...betLog];
    const bet = newBetLog.find(b => b.id === id);
    if (bet) {
      bet.actualOdd = parseFloat(value) || 0;
    }
    setBetLog(newBetLog);
  };

  const calculateProfitLoss = (bet: BetLogEntry): number => {
    if (bet.stake > 0 && bet.actualOdd > 0) {
      if (bet.actualOdd >= bet.predictedValue) {
        // Win
        return bet.stake * (bet.predictedValue - 1);
      } else {
        // Loss
        return -bet.stake;
      }
    }
    return 0;
  };
  
  const totalProfitLoss = betLog.reduce((acc, bet) => acc + calculateProfitLoss(bet), 0);
  const initialStake = betLog.reduce((acc, bet) => acc + bet.stake, 0);
  const finalAmount = initialStake + totalProfitLoss;


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <CardTitle>Betting Log & Performance</CardTitle>
        </div>
        <CardDescription>
            Track your bets against AI predictions and see your performance. Use a common stake for all bets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
            <Label htmlFor="common-stake" className="font-semibold">Common Stake:</Label>
            <Input
              id="common-stake"
              type="number"
              placeholder="Enter common stake"
              className="w-32"
              value={commonStake || ''}
              onChange={(e) => handleCommonStakeChange(e.target.value)}
            />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Round</TableHead>
              <TableHead>Predicted Value</TableHead>
              <TableHead>Stake Amount</TableHead>
              <TableHead>Actual Odd</TableHead>
              <TableHead>Profit/Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {betLog.map((bet) => {
              const profitLoss = calculateProfitLoss(bet);
              return (
                <TableRow key={bet.id}>
                  <TableCell>Round {bet.id + 1}</TableCell>
                  <TableCell>{bet.predictedValue.toFixed(2)}x</TableCell>
                  <TableCell>{bet.stake.toFixed(2)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Enter actual odd"
                      className="w-28"
                      value={bet.actualOdd || ''}
                      onChange={(e) => handleActualOddChange(bet.id, e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={profitLoss > 0 ? "default" : profitLoss < 0 ? "destructive" : "secondary"}>
                      {profitLoss.toFixed(2)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className='flex justify-end'>
          <div className="text-right">
              <p className="text-lg font-semibold">Final Amount: <span className={finalAmount >= initialStake ? "text-green-600" : "text-red-600"}>{finalAmount.toFixed(2)}</span></p>
              <p className="text-sm text-muted-foreground">Initial Stake: {initialStake.toFixed(2)} | Total P/L: {totalProfitLoss.toFixed(2)}</p>
          </div>
      </CardFooter>
    </Card>
  );
}
