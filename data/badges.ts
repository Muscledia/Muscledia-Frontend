export type Badge = {
  id: string;
  name: string;
  description: string;
  unlockCriteria: string;
  imageUrl: string;
  criteriaType: 'level' | 'streak' | 'challenges' | 'special';
  criteriaValue: number;
};

export const badges: Badge[] = [
  {
    id: 'badge1',
    name: 'First Steps',
    description: 'You\'ve taken your first steps on your fitness journey!',
    unlockCriteria: 'Complete your first challenge',
    imageUrl: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=200',
    criteriaType: 'challenges',
    criteriaValue: 1,
  },
  {
    id: 'badge2',
    name: 'Consistent Warrior',
    description: 'You\'ve maintained a 3-day workout streak!',
    unlockCriteria: 'Maintain a 3-day workout streak',
    imageUrl: 'https://images.pexels.com/photos/3761171/pexels-photo-3761171.jpeg?auto=compress&cs=tinysrgb&w=200',
    criteriaType: 'streak',
    criteriaValue: 3,
  },
  {
    id: 'badge3',
    name: 'Dedication Master',
    description: 'You\'ve maintained a 7-day workout streak!',
    unlockCriteria: 'Maintain a 7-day workout streak',
    imageUrl: 'https://images.pexels.com/photos/6551144/pexels-photo-6551144.jpeg?auto=compress&cs=tinysrgb&w=200',
    criteriaType: 'streak',
    criteriaValue: 7,
  },
  {
    id: 'badge4',
    name: 'Challenge Hunter',
    description: 'You\'ve completed 10 challenges!',
    unlockCriteria: 'Complete 10 challenges',
    imageUrl: 'https://images.pexels.com/photos/6551088/pexels-photo-6551088.jpeg?auto=compress&cs=tinysrgb&w=200',
    criteriaType: 'challenges',
    criteriaValue: 10,
  },
  {
    id: 'badge5',
    name: 'Evolution Begins',
    description: 'You\'ve reached level 5!',
    unlockCriteria: 'Reach level 5',
    imageUrl: 'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=200',
    criteriaType: 'level',
    criteriaValue: 5,
  },
  {
    id: 'badge6',
    name: 'Rising Star',
    description: 'You\'ve reached level 10!',
    unlockCriteria: 'Reach level 10',
    imageUrl: 'https://images.pexels.com/photos/6551061/pexels-photo-6551061.jpeg?auto=compress&cs=tinysrgb&w=200',
    criteriaType: 'level',
    criteriaValue: 10,
  },
  {
    id: 'badge7',
    name: 'Fitness Master',
    description: 'You\'ve reached level 20!',
    unlockCriteria: 'Reach level 20',
    imageUrl: 'https://images.pexels.com/photos/6551041/pexels-photo-6551041.jpeg?auto=compress&cs=tinysrgb&w=200',
    criteriaType: 'level',
    criteriaValue: 20,
  },
  {
    id: 'badge8',
    name: 'Legend Status',
    description: 'You\'ve reached level 30!',
    unlockCriteria: 'Reach level 30',
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg?auto=compress&cs=tinysrgb&w=200',
    criteriaType: 'level',
    criteriaValue: 30,
  },
];