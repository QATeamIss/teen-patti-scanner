import React from 'react';
import { HandType } from '../logic/teenPatti';
import type { HandInfo, HandTypeValue } from '../logic/teenPatti';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, Info, Trophy } from 'lucide-react';

interface ResultPanelProps {
    hand: HandInfo;
    winChance: number;
}

const HandTypeLabels: Record<HandTypeValue, string> = {
    [HandType.Trail]: 'Trail / Trio',
    [HandType.PureSequence]: 'Pure Sequence',
    [HandType.Sequence]: 'Sequence',
    [HandType.Color]: 'Color / Flush',
    [HandType.Pair]: 'Pair',
    [HandType.HighCard]: 'High Card'
};

const HandRanks: Record<HandTypeValue, number> = {
    [HandType.Trail]: 1,
    [HandType.PureSequence]: 2,
    [HandType.Sequence]: 3,
    [HandType.Color]: 4,
    [HandType.Pair]: 5,
    [HandType.HighCard]: 6
};

export const ResultPanel: React.FC<ResultPanelProps> = ({ hand, winChance }) => {
    const getProgressColor = (percent: number) => {
        if (percent > 75) return '#10b981'; // Green
        if (percent > 45) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const handRank = HandRanks[hand.type];

    const getAnalysis = () => {
        if (hand.type === HandType.Trail) {
            return `This is a ${hand.handName}, the strongest possible combination. You only lose to a Trail with higher values.`;
        }
        if (hand.type >= HandType.Sequence) {
            return `A very strong ${hand.handName}. It beats all Colors, Pairs, and High Cards. Watch out for Pure Sequences or higher Trails.`;
        }
        if (winChance > 60) {
            return `Your win probability is high because your ${hand.handName} is quite rare in this 3-deck AKQJ game.`;
        }
        return `This ${hand.handName} is vulnerable. While it beats lower cards, most players with a Sequence or better will win.`;
    };

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm glass-panel p-6 space-y-4"
        >
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Analysis</p>
                    <h2 className="text-2xl font-bold font-outfit text-white">{hand.handName}</h2>
                    <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="text-xs font-semibold text-gray-300">Rank {handRank} of 6 Hand Types</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Win Chance</p>
                    <h2 className="text-3xl font-bold font-outfit" style={{ color: getProgressColor(winChance) }}>
                        {winChance.toFixed(1)}%
                    </h2>
                </div>
            </div>

            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${winChance}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{ background: getProgressColor(winChance) }}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="glass-panel p-3 bg-white/5 border-none">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Beats</p>
                    <div className="flex items-center gap-2 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-[11px] font-semibold text-white">
                            Lower {hand.handName.split(' ')[0]}s
                        </span>
                    </div>
                </div>
                <div className="glass-panel p-3 bg-white/5 border-none">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Beaten By</p>
                    <div className="flex items-center gap-2 mt-1">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-[11px] font-semibold text-white">
                            Trails / Sequences
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Strategy Note</p>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                        {getAnalysis()}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
