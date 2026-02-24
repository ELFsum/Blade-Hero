
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
  skills: {
    q: { unlocked: false, charges: 0, maxCharges: 1, killsNeeded: 10, currentKills: 0, level: 1, damageMult: 1, extraValue: 1 },
    e: { unlocked: false, charges: 0, maxCharges: 1, killsNeeded: 25, currentKills: 0, level: 1, damageMult: 1, extraValue: 2000, extraValue2: 0.4 },
    f: { unlocked: false, charges: 0, maxCharges: 1, killsNeeded: 50, currentKills: 0, level: 1, damageMult: 5 },
  },
  isInvincible: false,
  isSpinning: false,
};

export const UPGRADE_POOL: UpgradeOption[] = [
  {
    id: 'skill_q',
    name: 'Flying Blade (Q)',
    description: 'Fires a spectral blade in your aim direction. Recharge: 10 kills.',
    icon: 'fa-shuttle-space',
    effect: (s) => ({ ...s, skills: { ...s.skills, q: { ...s.skills.q, unlocked: true, charges: 1 } } }),
  },
  {
    id: 'skill_e',
    name: 'Blade Storm (E)',
    description: 'Spin rapidly, gain speed and invincibility for 2s. Recharge: 25 kills.',
    icon: 'fa-rotate',
    effect: (s) => ({ ...s, skills: { ...s.skills, e: { ...s.skills.e, unlocked: true, charges: 1 } } }),
  },
  {
    id: 'skill_f',
    name: 'Neon Nova (F)',
    description: 'Deals massive damage to all enemies on screen. Recharge: 50 kills.',
    icon: 'fa-sun',
    effect: (s) => ({ ...s, skills: { ...s.skills, f: { ...s.skills.f, unlocked: true, charges: 1 } } }),
  },
  // Q Upgrades
  {
    id: 'q_count',
    name: 'Multi-Blade',
    description: 'Q fires +1 additional blade.',
    icon: 'fa-clone',
    effect: (s) => ({ ...s, skills: { ...s.skills, q: { ...s.skills.q, extraValue: (s.skills.q.extraValue || 1) + 1 } } }),
  },
  {
    id: 'q_damage',
    name: 'Heavy Edge',
    description: 'Q blades deal 50% more damage.',
    icon: 'fa-gavel',
    effect: (s) => ({ ...s, skills: { ...s.skills, q: { ...s.skills.q, damageMult: s.skills.q.damageMult * 1.5 } } }),
  },
  {
    id: 'q_energy',
    name: 'Quick Charge (Q)',
    description: 'Q recharge requirement reduced by 2 kills.',
    icon: 'fa-battery-half',
    effect: (s) => ({ ...s, skills: { ...s.skills, q: { ...s.skills.q, killsNeeded: Math.max(3, s.skills.q.killsNeeded - 2) } } }),
  },
  // E Upgrades
  {
    id: 'e_duration',
    name: 'Eternal Storm',
    description: 'E duration increased by 1s.',
    icon: 'fa-hourglass-half',
    effect: (s) => ({ ...s, skills: { ...s.skills, e: { ...s.skills.e, extraValue: (s.skills.e.extraValue || 2000) + 1000 } } }),
  },
  {
    id: 'e_speed',
    name: 'Vortex Speed',
    description: 'E spin speed increased by 50%.',
    icon: 'fa-wind',
    effect: (s) => ({ ...s, skills: { ...s.skills, e: { ...s.skills.e, extraValue2: (s.skills.e.extraValue2 || 0.4) * 1.5 } } }),
  },
  {
    id: 'e_energy',
    name: 'Quick Charge (E)',
    description: 'E recharge requirement reduced by 5 kills.',
    icon: 'fa-battery-half',
    effect: (s) => ({ ...s, skills: { ...s.skills, e: { ...s.skills.e, killsNeeded: Math.max(5, s.skills.e.killsNeeded - 5) } } }),
  },
  // F Upgrades
  {
    id: 'f_damage',
    name: 'Supernova',
    description: 'F deals 40% more damage.',
    icon: 'fa-explosion',
    effect: (s) => ({ ...s, skills: { ...s.skills, f: { ...s.skills.f, damageMult: s.skills.f.damageMult * 1.4 } } }),
  },
  {
    id: 'f_energy',
    name: 'Quick Charge (F)',
    description: 'F recharge requirement reduced by 10 kills.',
    icon: 'fa-battery-half',
    effect: (s) => ({ ...s, skills: { ...s.skills, f: { ...s.skills.f, killsNeeded: Math.max(10, s.skills.f.killsNeeded - 10) } } }),
  },
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
    id: 'length_boost_extra',
    name: 'Longer Edge',
    description: 'Increase Blade Length by 15px.',
    icon: 'fa-arrows-left-right',
    effect: (s) => ({ ...s, bladeLength: s.bladeLength + 15 }),
  },
  {
    id: 'lifesteal',
    name: 'Nano Siphon',
    description: 'Attacks deal 50% more damage.',
    icon: 'fa-skull',
    effect: (s) => ({ ...s, attackPower: s.attackPower * 1.5 }),
  },
];
