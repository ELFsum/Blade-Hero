
import React from 'react';
import { GameState, PlayerStats, UpgradeOption } from '../types';

interface OverlayProps {
  gameState: GameState;
  stats: PlayerStats;
  upgrades: UpgradeOption[];
  survivalTime: number;
  onStart: () => void;
  onSelectUpgrade: (upgrade: UpgradeOption) => void;
}

const Overlay: React.FC<OverlayProps> = ({ 
  gameState, 
  stats, 
  upgrades, 
  survivalTime, 
  onStart, 
  onSelectUpgrade 
}) => {
  if (gameState === GameState.PLAYING) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-500">
      
      {gameState === GameState.START && (
        <div className="text-center p-8 bg-slate-900 border-2 border-blue-500 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.5)] max-w-md animate-in fade-in zoom-in duration-300">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent italic tracking-tighter">
            NEON BLADE
          </h1>
          <p className="text-slate-400 mb-8">
            Defend yourself against the void swarm. Move with WASD, aim with mouse, and click to lunge.
          </p>
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-lg overflow-hidden"
          >
            <span className="relative z-10">START MISSION</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      )}

      {gameState === GameState.UPGRADE && (
        <div className="max-w-4xl w-full px-4">
          <h2 className="text-4xl font-black text-center mb-10 text-purple-400 drop-shadow-lg">LEVEL UP! SELECT UPGRADE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upgrades.map((upgrade) => (
              <button
                key={upgrade.id}
                onClick={() => onSelectUpgrade(upgrade)}
                className="group relative flex flex-col items-center p-6 bg-slate-900 border border-slate-700 hover:border-purple-500 rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] text-left"
              >
                <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                  <i className={`fas ${upgrade.icon} text-2xl text-purple-300 group-hover:text-white`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{upgrade.name}</h3>
                <p className="text-slate-400 text-sm text-center">{upgrade.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === GameState.GAMEOVER && (
        <div className="text-center p-12 bg-slate-900 border-2 border-rose-600 rounded-3xl shadow-[0_0_50px_rgba(225,29,72,0.5)] max-w-lg">
          <h2 className="text-5xl font-black text-rose-500 mb-2">SYSTEM FAILURE</h2>
          <div className="h-1 w-full bg-slate-800 my-6 rounded-full overflow-hidden">
             <div className="h-full bg-rose-600 animate-[pulse_1s_infinite]" style={{ width: '100%' }}></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="text-xs text-slate-500 uppercase">Survival Time</div>
              <div className="text-2xl font-mono text-white">{Math.floor(survivalTime)}s</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="text-xs text-slate-500 uppercase">Eliminations</div>
              <div className="text-2xl font-mono text-white">{stats.killCount}</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl col-span-2">
              <div className="text-xs text-slate-500 uppercase">Peak Level</div>
              <div className="text-2xl font-mono text-white">{stats.level}</div>
            </div>
          </div>
          <button 
            onClick={onStart}
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-xl transition-all hover:scale-[1.02] shadow-lg"
          >
            REBOOT SYSTEM
          </button>
        </div>
      )}
    </div>
  );
};

export default Overlay;
