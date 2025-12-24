import React, { useState } from 'react';
import type { Card, Rank, Suit } from '../logic/teenPatti';
import { Heart, Diamond, Spade, Club, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ManualEntryProps {
    onComplete: (cards: Card[]) => void;
    onCancel: () => void;
}

const Ranks: Rank[] = ['A', 'K', 'Q', 'J'];
const Suits: { key: Suit; Icon: any; color: string }[] = [
    { key: 'H', Icon: Heart, color: 'text-red-500' },
    { key: 'D', Icon: Diamond, color: 'text-red-500' },
    { key: 'S', Icon: Spade, color: 'text-white' },
    { key: 'C', Icon: Club, color: 'text-white' },
];

export const ManualEntry: React.FC<ManualEntryProps> = ({ onComplete, onCancel }) => {
    const [selectedCards, setSelectedCards] = useState<(Partial<Card> | null)[]>([{}, {}, {}]);
    const [activeSlot, setActiveSlot] = useState(0);

    const handleSelectRank = (rank: Rank) => {
        const newCards = [...selectedCards];
        newCards[activeSlot] = { ...newCards[activeSlot], rank };
        setSelectedCards(newCards);
    };

    const handleSelectSuit = (suit: Suit) => {
        const newCards = [...selectedCards];
        newCards[activeSlot] = { ...newCards[activeSlot], suit };
        setSelectedCards(newCards);
        if (activeSlot < 2) setActiveSlot(activeSlot + 1);
    };

    const isComplete = selectedCards.every(c => c?.rank && c?.suit);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
        >
            <div className="w-full max-w-md glass-panel p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-outfit">Select <span className="text-accent">Cards</span></h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">Cancel</button>
                </div>

                {/* Selected Slots */}
                <div className="flex justify-center gap-4">
                    {[0, 1, 2].map(i => (
                        <button
                            key={i}
                            onClick={() => setActiveSlot(i)}
                            className={`w-20 h-28 glass-panel border-2 transition-all flex flex-col items-center justify-center gap-2 ${activeSlot === i ? 'border-accent bg-accent/10' : 'border-white/10'
                                }`}
                        >
                            {selectedCards[i]?.rank ? (
                                <span className="text-2xl font-bold font-outfit">{selectedCards[i].rank}</span>
                            ) : (
                                <span className="text-xs text-gray-500">Rank</span>
                            )}
                            {selectedCards[i]?.suit && (
                                <div className={Suits.find(s => s.key === selectedCards[i]?.suit)?.color}>
                                    {React.createElement(Suits.find(s => s.key === selectedCards[i]?.suit)!.Icon, { size: 24, fill: 'currentColor' })}
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Rank Selector */}
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Step 1: Choose Rank</p>
                        <div className="grid grid-cols-4 gap-3">
                            {Ranks.map(r => (
                                <button
                                    key={r}
                                    onClick={() => handleSelectRank(r)}
                                    className={`p-4 rounded-xl glass-panel text-xl font-bold font-outfit border-none ${selectedCards[activeSlot]?.rank === r ? 'bg-accent text-white' : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Suit Selector */}
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Step 2: Choose Suit</p>
                        <div className="grid grid-cols-4 gap-3">
                            {Suits.map(({ key, Icon, color }) => (
                                <button
                                    key={key}
                                    onClick={() => handleSelectSuit(key)}
                                    className={`p-4 rounded-xl glass-panel flex flex-col items-center gap-2 border-none transition-transform active:scale-95 ${selectedCards[activeSlot]?.suit === key ? 'bg-accent text-white' : 'bg-white/5 hover:bg-white/10'
                                        } ${color}`}
                                >
                                    <Icon size={24} fill={selectedCards[activeSlot]?.suit === key ? 'white' : 'currentColor'} />
                                    <span className="text-[10px] uppercase">{key === 'H' ? 'Hearts' : key === 'D' ? 'Diamonds' : key === 'S' ? 'Spades' : 'Clubs'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        disabled={!isComplete}
                        onClick={() => {
                            onComplete(selectedCards as Card[]);
                            setSelectedCards([{}, {}, {}]);
                            setActiveSlot(0);
                        }}
                        className="flex-1 py-4 glass-panel bg-white/5 border-white/10 text-white font-bold text-sm disabled:opacity-50 transition-all flex justify-center items-center gap-2 hover:bg-white/10"
                    >
                        Save & Add Another
                    </button>
                    <button
                        disabled={!isComplete}
                        onClick={() => onComplete(selectedCards as Card[])}
                        className="flex-[2] py-4 glass-button bg-accent border-none text-white font-bold text-lg disabled:opacity-50 disabled:grayscale transition-all flex justify-center items-center gap-2"
                    >
                        {isComplete && <Check size={20} />}
                        Analyze Result
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
