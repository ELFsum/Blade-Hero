
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  UPGRADE = 'UPGRADE',
  GAMEOVER = 'GAMEOVER',
}

export interface SkillState {
  unlocked: boolean;
  charges: number;
  maxCharges: number;
  killsNeeded: number;
  currentKills: number;
  level: number;
  damageMult: number;
  extraValue?: number; // Used for count (Q), duration (E), etc.
  extraValue2?: number; // Used for spinSpeed (E), etc.
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  attackPower: number;
  bladeLength: number;
  bladeWidth: number;
  moveSpeed: number;
  xp: number;
  level: number;
  nextLevelXp: number;
  killCount: number;
  skills: {
    q: SkillState;
    e: SkillState;
    f: SkillState;
  };
  isInvincible: boolean;
  isSpinning: boolean;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number; // New: velocity X
  vy: number; // New: velocity Y
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: (stats: PlayerStats) => PlayerStats;
}
