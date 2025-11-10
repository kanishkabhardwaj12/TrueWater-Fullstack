import type { Sample } from './types';

export const samples: Sample[] = [
  {
    testID: 'HK-01',
    testNumber: 1,
    date: '2024-05-01',
    location: { name: 'Hauz Khas Lake, New Delhi', lat: 28.5543, lng: 77.2001 },
    imageUrl: 'https://picsum.photos/seed/hk01/600/400',
    imageHint: 'murky water',
    algaeContent: [
      { name: 'Microcystis', count: 150 },
      { name: 'Anabaena', count: 50 },
    ],
  },
  {
    testID: 'HK-01',
    testNumber: 2,
    date: '2024-06-15',
    location: { name: 'Hauz Khas Lake, New Delhi', lat: 28.5543, lng: 77.2001 },
    imageUrl: 'https://picsum.photos/seed/hk02/600/400',
    imageHint: 'green water',
    algaeContent: [
      { name: 'Microcystis', count: 250 },
      { name: 'Anabaena', count: 70 },
      { name: 'Oscillatoria', count: 20 },
    ],
  },
  {
    testID: 'SL-01',
    testNumber: 1,
    date: '2024-06-20',
    location: { name: 'Sanjay Lake, New Delhi', lat: 28.6186, lng: 77.3051 },
    imageUrl: 'https://picsum.photos/seed/sl01/600/400',
    imageHint: 'clear water',
    algaeContent: [{ name: 'Chlorella', count: 30 }],
  },
  {
    testID: 'YR-01',
    testNumber: 1,
    date: '2024-07-01',
    location: { name: 'Yamuna River, Okhla', lat: 28.5284, lng: 77.2974 },
    imageUrl: 'https://picsum.photos/seed/yr01/600/400',
    imageHint: 'polluted river',
    algaeContent: [
      { name: 'Microcystis', count: 500 },
      { name: 'Cylindrospermopsis', count: 120 },
      { name: 'Aphanizomenon', count: 80 },
    ],
  },
  {
    testID: 'YR-01',
    testNumber: 2,
    date: '2024-07-15',
    location: { name: 'Yamuna River, Okhla', lat: 28.5284, lng: 77.2974 },
    imageUrl: 'https://picsum.photos/seed/yr02/600/400',
    imageHint: 'dark green river',
    algaeContent: [
      { name: 'Microcystis', count: 450 },
      { name: 'Cylindrospermopsis', count: 150 },
      { name: 'Aphanizomenon', count: 60 },
    ],
  },
];
