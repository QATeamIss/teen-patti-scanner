import React from 'react';
import type { Card as CardType } from '../logic/teenPatti';
import { Heart, Diamond, Spade, Club } from 'lucide-react';
import { motion } from 'framer-motion';

interface CardProps {
    card: CardType;
    index: number;
}

export const CardUI: React.FC<CardProps> = ({ card, index }) => {
    const isRed = card.suit === 'H' || card.suit === 'D';

    const SuitIcon = () => {
        switch (card.suit) {
            case 'H': return <Heart className="w-6 h-6 fill-current" />;
            case 'D': return <Diamond className="w-6 h-6 fill-current" />;
            case 'S': return <Spade className="w-6 h-6 fill-current" />;
            case 'C': return <Club className="w-6 h-6 fill-current" />;
        }
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`w-24 h-36 glass-panel flex flex-col items-center justify-between p-3 relative select-none ${isRed ? 'text-red-500' : 'text-white'}`}
        >
            <div className="flex flex-col items-start w-full">
                <span className="text-xl font-bold font-outfit leading-none">{card.rank}</span>
                <SuitIcon />
            </div>

            <div className="text-3xl">
                <SuitIcon />
            </div>

            <div className="flex flex-col items-end w-full rotate-180">
                <span className="text-xl font-bold font-outfit leading-none">{card.rank}</span>
                <SuitIcon />
            </div>
        </motion.div>
    );
};
