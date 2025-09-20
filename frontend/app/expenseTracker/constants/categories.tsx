import { type ReactElement } from 'react';
import { FaUtensils, FaTshirt, FaBus, FaGamepad, FaHeartbeat, FaBook, FaHome, FaBolt, FaBoxOpen } from 'react-icons/fa';
import { MdLocalDrink } from 'react-icons/md';

export const CATEGORY_OPTIONS: string[] = [
    'Food',
    'Drink',
    'Clothing',
    'Entertainment',
    'Transportation',
    'Health',
    'Education',
    'Housing',
    'Utilities',
    'Other',
];

export const CATEGORY_ICON_MAP = {
    Food: <FaUtensils />,
    Drink: <MdLocalDrink />,
    Clothing: <FaTshirt />,
    Entertainment: <FaGamepad />,
    Transportation: <FaBus />,
    Health: <FaHeartbeat />,
    Education: <FaBook />,
    Housing: <FaHome />,
    Utilities: <FaBolt />,
    Other: <FaBoxOpen />,
} satisfies Record<string, ReactElement>;

export const DEFAULT_CATEGORY_ICON: ReactElement = <FaBoxOpen />;

export function getCategoryIcon(type?: string): ReactElement {
    if (!type) return DEFAULT_CATEGORY_ICON;
    if (type in CATEGORY_ICON_MAP) {
        return CATEGORY_ICON_MAP[type as keyof typeof CATEGORY_ICON_MAP];
    }
    return DEFAULT_CATEGORY_ICON;
}
