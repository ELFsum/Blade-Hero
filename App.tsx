
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, PlayerStats, UpgradeOption } from './types';
import { INITIAL_PLAYER_STATS, UPGRADE_POOL } from './constants';
import GameEngine from './components/GameEngine';
import Overlay from './components/Overlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [upgrades, setUpgrades] = useState<UpgradeOption[]>([]);
  const [survivalTime, setSurvivalTime] = useState(0);

  const startGame = () => {
    setStats(INITIAL_PLAYER_STATS);
    setSurvivalTime(0);
    setGameState(GameState.PLAYING);
  };

  const handleLevelUp = useCallback(() => {
    // Helper to get valid upgrades based on current unlocks
    const getAvailableUpgrades = () => {
      return UPGRADE_POOL.filter(u => {
        // Don't show base skill unlock if already unlocked
        if (u.id === 'skill_q' && stats.skills.q.unlocked) return false;
        if (u.id === 'skill_e' && stats.skills.e.unlocked) return false;
        if (u.id === 'skill_f' && stats.skills.f.unlocked) return false;
        
        // Skill-specific upgrades only if skill IS unlocked
        if (u.id.startsWith('q_') && !stats.skills.q.unlocked) return false;
        if (u.id.startsWith('e_') && !stats.skills.e.unlocked) return false;
        if (u.id.startsWith('f_') && !stats.skills.f.unlocked) return false;
        
        return true;
      });
    };

    const available = getAvailableUpgrades().sort(() => 0.5 - Math.random());
    const selectedUpgrades = available.slice(0, 3);

    setUpgrades(selectedUpgrades);
    setGameState(GameState.UPGRADE);
  }, [stats.skills]);

  const selectUpgrade = (upgrade: UpgradeOption) => {
    setStats(prev => {
      const newStats = upgrade.effect(prev);
      return {
        ...newStats,
        level: prev.level + 1,
        xp: prev.xp - prev.nextLevelXp,
        nextLevelXp: Math.floor(prev.nextLevelXp * 1.3),
      };
    });
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = useCallback((finalTime: number) => {
    setSurvivalTime(finalTime);
    setGameState(GameState.GAMEOVER);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 text-white overflow-hidden">
      {/* UI Hud */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="flex flex-col gap-2">
            <div className="bg-black/50 p-2 rounded border border-blue-500/30 backdrop-blur-sm">
              <div className="text-xs uppercase text-blue-400 font-bold mb-1">Health</div>
              <div className="w-48 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400" 
                  style={{ width: `${Math.max(0, Math.min(100, (Math.ceil(stats.hp) / stats.maxHp) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-right mt-1">{Math.min(Math.ceil(stats.maxHp), Math.ceil(stats.hp))} / {Math.ceil(stats.maxHp)}</div>
            </div>

            <div className="bg-black/50 p-2 rounded border border-purple-500/30 backdrop-blur-sm">
              <div className="text-xs uppercase text-purple-400 font-bold mb-1">Experience (LVL {stats.level})</div>
              <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 transition-all duration-300" 
                  style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Skill Buttons - Bottom Right */}
      {gameState === GameState.PLAYING && (
        <div 
          className="absolute bottom-8 right-8 z-20 flex gap-4 pointer-events-auto"
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {['q', 'e', 'f'].map((key) => {
            const skill = stats.skills[key as keyof typeof stats.skills];
            if (!skill.unlocked) return null;
            const progress = (skill.currentKills / skill.killsNeeded) * 100;
            const isReady = skill.charges > 0;
            
            return (
              <button 
                key={key} 
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (isReady) {
                    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
                  }
                }}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border backdrop-blur-md transition-all active:scale-90 ${isReady ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.4)] scale-110 cursor-pointer pointer-events-auto' : 'border-slate-700 bg-slate-900/50 opacity-60 cursor-not-allowed pointer-events-none'}`}
              >
                <div className="text-sm font-black uppercase text-white mb-1">{key}</div>
                <div className="relative w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${isReady ? 'bg-yellow-400' : 'bg-blue-500'}`}
                    style={{ width: `${isReady ? 100 : progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Game Canvas Engine */}
      <GameEngine 
        gameState={gameState} 
        stats={stats} 
        onLevelUp={handleLevelUp} 
        onGameOver={handleGameOver}
        onUpdateStats={setStats}
      />

      {/* Overlays */}
      <Overlay 
        gameState={gameState}
        stats={stats}
        upgrades={upgrades}
        survivalTime={survivalTime}
        onStart={startGame}
        onSelectUpgrade={selectUpgrade}
      />
    </div>
  );
};

export default App;
