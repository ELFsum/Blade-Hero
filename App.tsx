
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
    // Pick 3 random upgrades
    const shuffled = [...UPGRADE_POOL].sort(() => 0.5 - Math.random());
    setUpgrades(shuffled.slice(0, 3));
    setGameState(GameState.UPGRADE);
  }, []);

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
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300" 
                  style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-right mt-1">{Math.ceil(stats.hp)} / {Math.ceil(stats.maxHp)}</div>
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
