import React, { useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import { generateDeck, getHandInfo, calculateWinChance, HandType, getHandComparison } from '../logic/teenPatti';
import type { Card } from '../logic/teenPatti';
import { CardUI } from './CardUI';
import { ResultPanel } from './ResultPanel';
import { ManualEntry } from './ManualEntry';
import { Camera, RefreshCw, X, PlusCircle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const ScannerView: React.FC = () => {
    const { videoRef, startCamera, stopCamera, stream, error } = useCamera();
    const [detectedCards, setDetectedCards] = useState<Card[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [allHands, setAllHands] = useState<{ cards: Card[], id: number }[]>([]);

    const handleScanOrAdd = (cards: Card[]) => {
        setIsScanning(true);
        setIsManualEntryOpen(false); // Close manual entry immediately if open

        // Simulate scanning delay
        setTimeout(() => {
            const newHand = { cards, id: Date.now() };
            setAllHands(prev => [...prev, newHand]);
            setDetectedCards(cards);

            const hand = getHandInfo(cards);
            if (hand.type >= HandType.Sequence) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#a855f7', '#ec4899']
                });
            }
            setIsScanning(false);
        }, 1500);
    };

    const handleCameraClick = () => {
        if (!stream) {
            alert("Please start the camera first by clicking the red X/Camera icon at the bottom.");
            return;
        }

        // Mock Scan Logic: Ensure some "good" hands appear occasionally
        const roll = Math.random();
        let cards: Card[];
        const fullDeck = generateDeck(3);

        if (roll > 0.8) {
            // Force a Trail or Sequence
            const rank = (['A', 'K', 'Q', 'J'] as const)[Math.floor(Math.random() * 4)];
            if (Math.random() > 0.5) {
                // Trail
                cards = [{ rank, suit: 'H' }, { rank, suit: 'D' }, { rank, suit: 'S' }];
            } else {
                // Sequence (if possible)
                if (rank === 'A') cards = [{ rank: 'A', suit: 'H' }, { rank: 'K', suit: 'D' }, { rank: 'Q', suit: 'S' }];
                else if (rank === 'K') cards = [{ rank: 'K', suit: 'H' }, { rank: 'Q', suit: 'D' }, { rank: 'J', suit: 'S' }];
                else cards = fullDeck.sort(() => Math.random() - 0.5).slice(0, 3);
            }
        } else {
            cards = [...fullDeck].sort(() => Math.random() - 0.5).slice(0, 3);
        }

        handleScanOrAdd(cards);
    };

    const reset = () => {
        setDetectedCards([]);
        setAllHands([]);
    };

    const winChance = detectedCards.length === 3
        ? calculateWinChance(detectedCards, generateDeck(3).filter(c => !detectedCards.includes(c)))
        : 0;

    const winnerData = allHands.length > 1
        ? allHands.reduce((prev, curr) =>
            getHandInfo(curr.cards).score > getHandInfo(prev.cards).score ? curr : prev
        )
        : null;

    const winnerInfo = winnerData ? getHandInfo(winnerData.cards) : null;

    // Find runner up for a more human comparison
    const runnerUpData = allHands.length > 1
        ? allHands
            .filter(h => h.id !== winnerData?.id)
            .reduce((prev, curr) =>
                getHandInfo(curr.cards).score > getHandInfo(prev.cards).score ? curr : prev
            )
        : null;

    const runnerUpInfo = runnerUpData ? getHandInfo(runnerUpData.cards) : null;

    const winnerIndex = winnerData ? allHands.findIndex(h => h.id === winnerData.id) + 1 : 0;
    const runnerUpIndex = runnerUpData ? allHands.findIndex(h => h.id === runnerUpData.id) + 1 : 0;

    return (
        <div className="scanner-viewport bg-black flex flex-col items-center">
            {/* Camera Background */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[0.5]"
            />

            {/* Header */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
                <h1 className="text-xl font-bold font-outfit tracking-tight text-white">TEEN PATTI <span className="text-accent">ANALYZER</span></h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsManualEntryOpen(true)}
                        className="px-4 py-2 rounded-xl glass-panel text-white hover:bg-accent/20 transition-colors flex items-center gap-2 border-none"
                    >
                        <PlusCircle size={18} className="text-accent" />
                        <span className="text-xs font-bold uppercase tracking-wider">Add Player</span>
                    </button>
                </div>
            </div>

            {!stream && detectedCards.length === 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center p-8 text-center bg-black/40 backdrop-blur-sm">
                    <div className="space-y-4 max-w-xs">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                            <Camera size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold font-outfit text-white">Camera Offline</h3>
                        <p className="text-xs text-gray-400 leading-relaxed italic">
                            Click the camera icon at the bottom to start scanning, or use the "Add Player" button to enter cards manually.
                        </p>
                    </div>
                </div>
            )}

            {detectedCards.length === 0 && allHands.length === 0 && stream && (
                <div className="scan-overlay" />
            )}

            {/* Main Analysis Area */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 w-full px-6 gap-6">
                <AnimatePresence mode="wait">
                    {isManualEntryOpen ? (
                        <ManualEntry
                            onComplete={handleScanOrAdd}
                            onCancel={() => setIsManualEntryOpen(false)}
                        />
                    ) : allHands.length >= 2 ? (
                        /* Multiplayer Comparison Mode */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md space-y-4 max-h-[70vh] flex flex-col"
                        >
                            <div className="glass-panel p-4 bg-green-500/10 border-green-500/50 flex items-start gap-3">
                                <Trophy className="text-yellow-500 shrink-0 mt-1" size={24} />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Winner Recommendation</p>
                                    <p className="text-sm font-semibold text-white">
                                        Player {winnerIndex} wins with a {winnerInfo?.handName}.
                                    </p>
                                    <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                        Reason: {winnerInfo && runnerUpInfo
                                            ? `Player ${winnerIndex}'s ${winnerInfo.handName} wins because ${getHandComparison(winnerInfo, runnerUpInfo)} compared to Player ${runnerUpIndex}.`
                                            : `This is the strongest hand in the round.`}
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-y-auto space-y-3 pr-1 no-scrollbar flex-1">
                                {allHands.map((hand, i) => {
                                    const info = getHandInfo(hand.cards);
                                    const isWinner = hand.id === winnerData?.id;
                                    return (
                                        <motion.div
                                            key={hand.id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`glass-panel p-4 flex items-center justify-between border-2 transition-colors ${isWinner ? 'border-green-500 bg-green-500/20' : 'border-white/10'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-2">
                                                <p className="text-[10px] font-bold text-gray-400">PLAYER {i + 1}</p>
                                                <div className="flex gap-1.5">
                                                    {hand.cards.map((c, j) => (
                                                        <div key={j} className={`w-8 h-10 border rounded flex items-center justify-center font-bold text-xs ${c.suit === 'H' || c.suit === 'D' ? 'text-red-400 border-red-400/30 bg-red-400/5' : 'text-white border-white/20 bg-white/5'
                                                            }`}>
                                                            {c.rank}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-sm ${isWinner ? 'text-green-400' : 'text-white'}`}>
                                                    {isWinner && '🏆 '}
                                                    {info.type === HandType.HighCard ? 'High Card' : info.type === HandType.Pair ? 'Pair' : info.type === HandType.Trail ? 'Trail' : 'Sequence'}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-medium">
                                                    {info.type === HandType.HighCard ? 'No Combo' : 'Combo Detected'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : detectedCards.length === 3 ? (
                        /* Single Analysis Mode (My Cards) */
                        <div className="space-y-6 flex flex-col items-center">
                            <div className="flex gap-3">
                                {detectedCards.map((card, i) => (
                                    <CardUI key={i} card={card} index={i} />
                                ))}
                            </div>
                            <ResultPanel hand={getHandInfo(detectedCards)} winChance={winChance} />
                        </div>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="w-full p-8 flex justify-center items-center gap-6 z-20 pb-12">
                <button
                    onClick={reset}
                    className="p-4 rounded-full glass-panel text-white hover:bg-white/10 transition-colors"
                    title="Reset All"
                >
                    <RefreshCw className="w-6 h-6" />
                </button>

                <button
                    onClick={handleCameraClick}
                    disabled={isScanning || isManualEntryOpen}
                    className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.6)] active:scale-90 transition-transform disabled:opacity-50 text-white"
                >
                    {isScanning ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                            <RefreshCw className="w-8 h-8" />
                        </motion.div>
                    ) : (
                        <Camera className="w-8 h-8" />
                    )}
                </button>

                {!stream ? (
                    <button onClick={startCamera} className="p-4 rounded-full glass-panel text-white hover:bg-white/10 transition-colors">
                        <Camera className="w-6 h-6 opacity-60" />
                    </button>
                ) : (
                    <button onClick={stopCamera} className="p-4 rounded-full glass-panel bg-red-500/20 text-red-500 border-red-500/30">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {error && (
                <div className="absolute bottom-32 bg-red-500/80 p-3 rounded-lg text-sm z-30 text-white shadow-lg backdrop-blur-sm">
                    {error}
                </div>
            )}
        </div>
    );
};
