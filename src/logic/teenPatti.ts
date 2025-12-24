export type Rank = 'A' | 'K' | 'Q' | 'J';
export type Suit = 'S' | 'H' | 'D' | 'C';

export interface Card {
    rank: Rank;
    suit: Suit;
}

export const HandType = {
    Trail: 6,
    PureSequence: 5,
    Sequence: 4,
    Color: 3,
    Pair: 2,
    HighCard: 1
} as const;

export type HandTypeValue = typeof HandType[keyof typeof HandType];

export interface HandInfo {
    type: HandTypeValue;
    cards: Card[];
    score: number; // For tie-breaking
    handName: string;
}

const RankValues: Record<Rank, number> = {
    'A': 14,
    'K': 13,
    'Q': 12,
    'J': 11
};

export const getHandName = (type: HandTypeValue, cards: Card[]): string => {
    const sorted = [...cards].sort((a, b) => RankValues[b.rank] - RankValues[a.rank]);
    const r = sorted[0].rank;
    const rLong = r === 'A' ? 'Aces' : r === 'K' ? 'Kings' : r === 'Q' ? 'Queens' : 'Jacks';
    const rSingular = r === 'A' ? 'Ace' : r === 'K' ? 'King' : r === 'Q' ? 'Queen' : 'Jack';

    switch (type) {
        case HandType.Trail: return `Trail of ${rLong}`;
        case HandType.PureSequence: return `${rSingular}-High Pure Sequence`;
        case HandType.Sequence: return `${rSingular}-High Sequence`;
        case HandType.Color: return `${rSingular}-High Color`;
        case HandType.Pair:
            const pairRank = sorted[0].rank === sorted[1].rank ? sorted[0].rank : sorted[1].rank;
            const pLong = pairRank === 'A' ? 'Aces' : pairRank === 'K' ? 'Kings' : pairRank === 'Q' ? 'Queens' : 'Jacks';
            return `Pair of ${pLong}`;
        default: return `${rSingular} High Card`;
    }
};

export const getHandComparison = (hand1: HandInfo, hand2: HandInfo): string => {
    if (hand1.type > hand2.type) {
        return `their ${hand1.handName} outranks a ${hand2.handName}`;
    }
    if (hand1.type < hand2.type) {
        return `their ${hand1.handName} is outranked by a ${hand2.handName}`;
    }
    // Same type, tie-break on rank
    const v1_0 = RankValues[hand1.cards[0].rank];
    const v1_1 = RankValues[hand1.cards[1].rank];
    const v1_2 = RankValues[hand1.cards[2].rank];
    const v2_0 = RankValues[hand2.cards[0].rank];
    const v2_1 = RankValues[hand2.cards[1].rank];
    const v2_2 = RankValues[hand2.cards[2].rank];

    if (v1_0 > v2_0) return `their ${hand1.handName} has a higher top card than the ${hand2.handName}`;
    if (v1_0 < v2_0) return `their ${hand1.handName} has a lower top card than the ${hand2.handName}`;

    if (v1_1 > v2_1) return `their ${hand1.handName} has a higher second card`;
    if (v1_1 < v2_1) return `their ${hand1.handName} has a lower second card`;

    if (v1_2 > v2_2) return `their ${hand1.handName} has a higher third card`;
    if (v1_2 < v2_2) return `their ${hand1.handName} has a lower third card`;

    return "both hands are identical in rank";
};

export const getHandInfo = (cards: Card[]): HandInfo => {
    const sorted = [...cards].sort((a, b) => RankValues[b.rank] - RankValues[a.rank]);
    const ranks = sorted.map(c => c.rank);
    const suits = sorted.map(c => c.suit);

    const isTrail = ranks[0] === ranks[1] && ranks[1] === ranks[2];
    const isColor = suits[0] === suits[1] && suits[1] === suits[2];

    // Sequence logic for AKQJ: AKQ, KQJ
    const v0 = RankValues[ranks[0]];
    const v1 = RankValues[ranks[1]];
    const v2 = RankValues[ranks[2]];
    const isSequence = (v0 === v1 + 1 && v1 === v2 + 1);

    const isPureSequence = isSequence && isColor;

    const isPair = ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2];

    let type: HandTypeValue = HandType.HighCard;
    if (isTrail) type = HandType.Trail;
    else if (isPureSequence) type = HandType.PureSequence;
    else if (isSequence) type = HandType.Sequence;
    else if (isColor) type = HandType.Color;
    else if (isPair) type = HandType.Pair;

    // Scoring for tie-breakers: HandType * 1,000,000 + RankValues of cards in order
    const score = type * 1000000 + v0 * 10000 + v1 * 100 + v2;

    return { type, cards: sorted, score, handName: getHandName(type, sorted) };
};

export const generateDeck = (numDecks: number = 3): Card[] => {
    const ranks: Rank[] = ['A', 'K', 'Q', 'J'];
    const suits: Suit[] = ['S', 'H', 'D', 'C'];
    const deck: Card[] = [];

    for (let i = 0; i < numDecks; i++) {
        for (const rank of ranks) {
            for (const suit of suits) {
                deck.push({ rank, suit });
            }
        }
    }
    return deck;
};

export const calculateWinChance = (myCards: Card[], remainingDeck: Card[]): number => {
    const myHand = getHandInfo(myCards);
    let wins = 0;
    const simulations = 1000;

    for (let i = 0; i < simulations; i++) {
        const shuffled = [...remainingDeck].sort(() => Math.random() - 0.5);
        const opponentHandCards = shuffled.slice(0, 3);
        const opponentHand = getHandInfo(opponentHandCards);

        if (myHand.score > opponentHand.score) {
            wins++;
        } else if (myHand.score === opponentHand.score) {
            wins += 0.5; // Split
        }
    }

    return (wins / simulations) * 100;
};
