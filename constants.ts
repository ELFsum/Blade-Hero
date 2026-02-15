
import { PlayerStats, UpgradeOption } from './types';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  hp: 100,
  maxHp: 100,
  attackPower: 10,
  bladeLength: 60,
  bladeWidth: 4,
  moveSpeed: 3,
  xp: 0,
  level: 1,
  nextLevelXp: 50,
  killCount: 0,
};

export const UPGRADE_POOL: UpgradeOption[] = [
  {
    id: 'hp_boost',
    name: 'Vitality Core',
    description: 'Increase Max HP by 25% and heal to full.',
    icon: 'fa-heart',
    effect: (s) => ({ ...s, maxHp: s.maxHp * 1.25, hp: s.maxHp * 1.25 }),
  },
  {
    id: 'attack_boost',
    name: 'Serrated Edge',
    description: 'Increase Attack Power by 30%.',
    icon: 'fa-burst',
    effect: (s) => ({ ...s, attackPower: s.attackPower * 1.3 }),
  },
  {
    id: 'length_boost',
    name: 'Extended Reach',
    description: 'Increase Blade Length by 20px.',
    icon: 'fa-arrows-left-right',
    effect: (s) => ({ ...s, bladeLength: s.bladeLength + 20 }),
  },
  {
    id: 'speed_boost',
    name: 'Overdrive',
    description: 'Increase Movement Speed by 15%.',
    icon: 'fa-bolt',
    effect: (s) => ({ ...s, moveSpeed: s.moveSpeed * 1.15 }),
  },
  {
    id: 'width_boost',
    name: 'Broad Blade',
    description: 'Increase Blade Width for easier hits.',
    icon: 'fa-ruler-horizontal',
    effect: (s) => ({ ...s, bladeWidth: s.bladeWidth + 2 }),
  },
  {
    id: 'lifesteal',
    name: 'Nano Siphon',
    description: 'Attacks deal 50% more damage.',
    icon: 'fa-skull',
    effect: (s) => ({ ...s, attackPower: s.attackPower * 1.5 }),
  },
];
