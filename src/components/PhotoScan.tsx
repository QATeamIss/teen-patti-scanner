import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check } from 'lucide-react';
import type { Card, Rank, Suit } from '../logic/teenPatti';

interface PhotoScanProps {
    onComplete: (cards: Card[]) => void;
    onCancel: () => void;
}

export const PhotoScan: React.FC<PhotoScanProps> = ({ onComplete, onCancel }) => {
    const [photo, setPhoto] = useState<string | null>(null);
    const [detectedCards, setDetectedCards] = useState<Card[]>([]);
    const [isSelectingCard, setIsSelectingCard] = useState(false);
    const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const ranks: Rank[] = ['A', 'K', 'Q', 'J'];
    const suits: { value: Suit; label: string; symbol: string }[] = [
        { value: 'H', label: 'Hearts', symbol: '♥' },
        { value: 'D', label: 'Diamonds', symbol: '♦' },
        { value: 'S', label: 'Spades', symbol: '♠' },
        { value: 'C', label: 'Clubs', symbol: '♣' }
    ];

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
            }
        } catch (err) {
            console.error('Camera access denied:', err);
            alert('Please allow camera access to scan cards');
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const photoData = canvas.toDataURL('image/jpeg');
                setPhoto(photoData);

                // Stop camera
                const stream = video.srcObject as MediaStream;
                stream?.getTracks().forEach(track => track.stop());
                setIsCameraActive(false);
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhoto(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoClick = () => {
        if (detectedCards.length < 3) {
            setIsSelectingCard(true);
        }
    };

    const handleCardSelect = (rank: Rank, suit: Suit) => {
        const newCard: Card = { rank, suit };
        const updatedCards = [...detectedCards, newCard];
        setDetectedCards(updatedCards);
        setIsSelectingCard(false);
        setSelectedRank(null);

        if (updatedCards.length === 3) {
            setTimeout(() => onComplete(updatedCards), 500);
        }
    };

    const removeCard = (index: number) => {
        setDetectedCards(detectedCards.filter((_, i) => i !== index));
    };

    const retakePhoto = () => {
        setPhoto(null);
        setDetectedCards([]);
        setIsSelectingCard(false);
        setSelectedRank(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <div className="w-full max-w-2xl glass-panel p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white font-outfit">Scan Cards from Photo</h2>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="text-white" size={24} />
                    </button>
                </div>

                {/* Instructions */}
                {!photo && (
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                        <p className="text-sm text-white/80">
                            📸 Take or upload a photo of your cards, then click on each card to identify it.
                        </p>
                    </div>
                )}

                {/* Photo Capture/Upload */}
                {!photo ? (
                    <div className="space-y-4">
                        {/* Camera View */}
                        {isCameraActive ? (
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full rounded-xl"
                                />
                                <canvas ref={canvasRef} className="hidden" />
                                <button
                                    onClick={capturePhoto}
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-accent border-4 border-white shadow-lg hover:scale-110 transition-transform"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={startCamera}
                                    className="glass-panel p-8 hover:bg-white/10 transition-colors flex flex-col items-center gap-3"
                                >
                                    <Camera size={48} className="text-accent" />
                                    <span className="text-white font-semibold">Take Photo</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="glass-panel p-8 hover:bg-white/10 transition-colors flex flex-col items-center gap-3"
                                >
                                    <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-white font-semibold">Upload Photo</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Photo Display */}
                        <div className="relative">
                            <img
                                src={photo}
                                alt="Captured cards"
                                className="w-full rounded-xl cursor-crosshair"
                                onClick={handlePhotoClick}
                            />
                            {detectedCards.length < 3 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-black/70 px-6 py-3 rounded-full">
                                        <p className="text-white text-sm font-semibold">
                                            Click on card {detectedCards.length + 1} of 3
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Detected Cards */}
                        <div className="flex gap-3 justify-center">
                            {detectedCards.map((card, index) => (
                                <div key={index} className="relative">
                                    <div className="w-16 h-24 glass-panel flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-white">{card.rank}</span>
                                        <span className="text-xl">{suits.find(s => s.value === card.suit)?.symbol}</span>
                                    </div>
                                    <button
                                        onClick={() => removeCard(index)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                                    >
                                        <X size={14} className="text-white" />
                                    </button>
                                </div>
                            ))}
                            {Array.from({ length: 3 - detectedCards.length }).map((_, i) => (
                                <div key={`empty-${i}`} className="w-16 h-24 glass-panel border-dashed border-2 border-white/30" />
                            ))}
                        </div>

                        {/* Card Selection Modal */}
                        <AnimatePresence>
                            {isSelectingCard && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                                    onClick={() => setIsSelectingCard(false)}
                                >
                                    <div className="glass-panel p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                                        <h3 className="text-lg font-bold text-white text-center">
                                            {selectedRank ? 'Select Suit' : 'Select Rank'}
                                        </h3>

                                        {!selectedRank ? (
                                            <div className="grid grid-cols-4 gap-3">
                                                {ranks.map((rank) => (
                                                    <button
                                                        key={rank}
                                                        onClick={() => setSelectedRank(rank)}
                                                        className="aspect-square glass-panel text-3xl font-bold text-white hover:bg-accent/20 transition-colors"
                                                    >
                                                        {rank}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                {suits.map((suit) => (
                                                    <button
                                                        key={suit.value}
                                                        onClick={() => handleCardSelect(selectedRank, suit.value)}
                                                        className="glass-panel p-4 hover:bg-accent/20 transition-colors flex flex-col items-center gap-2"
                                                    >
                                                        <span className="text-4xl">{suit.symbol}</span>
                                                        <span className="text-sm text-white/80">{suit.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={retakePhoto}
                                className="flex-1 py-3 glass-panel hover:bg-white/10 transition-colors text-white font-semibold"
                            >
                                Retake Photo
                            </button>
                            {detectedCards.length === 3 && (
                                <button
                                    onClick={() => onComplete(detectedCards)}
                                    className="flex-1 py-3 glass-button bg-accent text-white font-semibold flex items-center justify-center gap-2"
                                >
                                    <Check size={20} />
                                    Confirm Cards
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
