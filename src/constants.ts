export type Party = 
  | 'ADMK' 
  | 'DMK' 
  | 'TVK' 
  | 'NTK' 
  | 'Others';

export interface VoteData {
  party: Party;
  otherPartyName?: string;
  age: string;
}

export interface PartyInfo {
  id: Party;
  label: string;
  subLabel: string;
  color: string;
  bgImage?: string;
}

export const PARTIES: PartyInfo[] = [
  {
    id: 'ADMK',
    label: 'AIADMK + BJP + PMK + AMMK',
    subLabel: 'ADMK',
    color: 'bg-green-800',
    bgImage: 'https://res.cloudinary.com/dhjfoibdf/image/upload/q_auto/f_auto/v1776494725/18dc94102324473.5f33ed36bf8e8_yq2zho.png'
  },
  {
    id: 'DMK',
    label: 'DMK + INC + VCK',
    subLabel: 'DMK',
    color: 'bg-red-900',
    bgImage: 'https://res.cloudinary.com/dhjfoibdf/image/upload/q_auto/f_auto/v1776494771/OIP_bs4kkd.jpg'
  },
  {
    id: 'TVK',
    label: 'TVK',
    subLabel: "Vijay's Party",
    color: 'bg-gradient-to-r from-red-600 to-yellow-500',
    bgImage: 'https://res.cloudinary.com/dhjfoibdf/image/upload/q_auto/f_auto/v1776494808/e5184f8ef85984e8bd592fcb9a9629cb_kqtekl.jpg'
  },
  {
    id: 'NTK',
    label: 'NTK',
    subLabel: 'Naam Tamilar Katchi',
    color: 'bg-orange-600'
  },
  {
    id: 'Others',
    label: 'Others / Undecided',
    subLabel: 'Others',
    color: 'bg-zinc-700'
  }
];

export const AGE_RANGES = [
  '18-25',
  '26-35',
  '36-45',
  '46-55',
  '56-65',
  '66 & above'
];
