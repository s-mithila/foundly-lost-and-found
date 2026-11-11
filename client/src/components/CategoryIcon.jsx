// client/src/components/CategoryIcon.jsx
import React from 'react';
import { Laptop, CreditCard, Key, Backpack, BookOpen, Shirt, Heart, HelpCircle } from 'lucide-react';

export function CategoryIcon({ category, size = 16, className = '' }) {
  switch (category) {
    case 'Electronics':
      return <Laptop size={size} className={className} />;
    case 'IDs & Cards':
      return <CreditCard size={size} className={className} />;
    case 'Keys & Wallets':
      return <Key size={size} className={className} />;
    case 'Bags & Luggage':
      return <Backpack size={size} className={className} />;
    case 'Books & Stationery':
      return <BookOpen size={size} className={className} />;
    case 'Clothing & Accessories':
      return <Shirt size={size} className={className} />;
    case 'Personal Essentials':
      return <Heart size={size} className={className} />;
    case 'Others':
    default:
      return <HelpCircle size={size} className={className} />;
  }
}
