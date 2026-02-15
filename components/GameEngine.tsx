
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, PlayerStats, Enemy, Particle } from '../types';

interface GameEngineProps {
  gameState: GameState;
  stats: PlayerStats;
  onLevelUp: () => void;
  onGameOver: (time: number) => void;
  onUpdateStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
}

interface JoystickState {
  active: boolean;
  base: { x: number; y: number };
  current: { x: number; y: number };
  vector: { x: number; y: number };
  touchId: number | null;
}

const GameEngine: React.FC<GameEngineProps> = ({ 
  gameState, 
  stats, 
  onLevelUp, 
  onGameOver, 
  onUpdateStats 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const statsRef = useRef(stats);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const playerPosRef = useRef({ x: 0, y: 0 }); 
  const cameraRef = useRef({ x: 0, y: 0 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const gameTimeRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const stabOffsetRef = useRef(0);
  const isStabbingRef = useRef(false);

  // Dual Joystick Refs
  const moveJoystick = useRef<JoystickState>({
    active: false, base: { x: 0, y: 0 }, current: { x: 0, y: 0 }, vector: { x: 0, y: 0 }, touchId: null
  });
  const aimJoystick = useRef<JoystickState>({
    active: false, base: { x: 0, y: 0 }, current: { x: 0, y: 0 }, vector: { x: 0, y: 0 }, touchId: null
  });

  const currentBladeAngleRef = useRef(0);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const createEnemy = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.max(window.innerWidth, window.innerHeight) * 0.7;
    const spawnX = playerPosRef.current.x + Math.cos(angle) * distance;
    const spawnY = playerPosRef.current.y + Math.sin(angle) * distance;

    const difficulty = 1 + gameTimeRef.current / 45;
    const hp = 15 * difficulty;
    
    const newEnemy: Enemy = {
      id: Math.random().toString(36).substr(2, 9),
      x: spawnX, y: spawnY,
      vx: 0, vy: 0,
      radius: 12 + Math.random() * 8,
      hp, maxHp: hp,
      speed: (1.2 + Math.random() * 0.6) * (1 + gameTimeRef.current / 180),
      damage: 0.15,
      color: `hsl(${Math.random() * 40 + 340}, 80%, 60%)`,
    };
    enemiesRef.current.push(newEnemy);
  }, []);

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1.0, color,
      });
    }
  };

  const update = (dt: number) => {
    if (gameState !== GameState.PLAYING) return;

    gameTimeRef.current += dt / 1000;
    const speed = statsRef.current.moveSpeed;
    
    // 1. Move Player (Keyboard + Left Joystick)
    let moveVx = 0;
    let moveVy = 0;
    if (keysRef.current['w'] || keysRef.current['arrowup']) moveVy -= 1;
    if (keysRef.current['s'] || keysRef.current['arrowdown']) moveVy += 1;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) moveVx -= 1;
    if (keysRef.current['d'] || keysRef.current['arrowright']) moveVx += 1;

    if (moveJoystick.current.active) {
      moveVx += moveJoystick.current.vector.x;
      moveVy += moveJoystick.current.vector.y;
    }

    const moveMag = Math.sqrt(moveVx * moveVx + moveVy * moveVy);
    if (moveMag > 0.05) {
      playerPosRef.current.x += (moveVx / (moveMag > 1 ? moveMag : 1)) * speed;
      playerPosRef.current.y += (moveVy / (moveMag > 1 ? moveMag : 1)) * speed;
    }

    // 2. Camera Follow
    const lerpFactor = 0.1;
    cameraRef.current.x += (playerPosRef.current.x - cameraRef.current.x) * lerpFactor;
    cameraRef.current.y += (playerPosRef.current.y - cameraRef.current.y) * lerpFactor;

    // 3. Orientation Logic (Right Joystick + Mouse)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    if (aimJoystick.current.active) {
      const mag = Math.sqrt(aimJoystick.current.vector.x ** 2 + aimJoystick.current.vector.y ** 2);
      if (mag > 0.1) {
        currentBladeAngleRef.current = Math.atan2(aimJoystick.current.vector.y, aimJoystick.current.vector.x);
      }
    } else {
      const mouseMoved = Math.abs(mouseRef.current.x - lastMouseRef.current.x) > 1 || Math.abs(mouseRef.current.y - lastMouseRef.current.y) > 1;
      if (mouseMoved) {
        currentBladeAngleRef.current = Math.atan2(
          mouseRef.current.y - centerY,
          mouseRef.current.x - centerX
        );
        lastMouseRef.current = { ...mouseRef.current };
      }
    }

    // Stab animation logic
    if (isStabbingRef.current) {
      stabOffsetRef.current += 12;
      if (stabOffsetRef.current > 40) isStabbingRef.current = false;
    } else {
      stabOffsetRef.current = Math.max(0, stabOffsetRef.current - 3);
    }

    // 4. Enemy Spawning
    const spawnRate = Math.max(200, 1000 - (gameTimeRef.current * 15));
    if (Date.now() - lastSpawnTimeRef.current > spawnRate) {
      createEnemy();
      lastSpawnTimeRef.current = Date.now();
    }

    // 5. Update Enemies & Collisions
    const bladeAngle = currentBladeAngleRef.current;
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const bladeFullLength = statsRef.current.bladeLength + stabOffsetRef.current;
    const bladeTipX = px + Math.cos(bladeAngle) * bladeFullLength;
    const bladeTipY = py + Math.sin(bladeAngle) * bladeFullLength;

    enemiesRef.current.forEach((enemy, index) => {
      // Basic movement towards player
      const dxToPlayer = px - enemy.x;
      const dyToPlayer = py - enemy.y;
      const distToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);
      
      // Move enemy using normalized direction + current knockback velocity
      const moveX = (dxToPlayer / distToPlayer) * enemy.speed;
      const moveY = (dyToPlayer / distToPlayer) * enemy.speed;
      
      enemy.x += moveX + enemy.vx;
      enemy.y += moveY + enemy.vy;

      // Friction for knockback
      enemy.vx *= 0.85;
      enemy.vy *= 0.85;

      // Damage player
      if (distToPlayer < enemy.radius + 15) {
        onUpdateStats(prev => ({ ...prev, hp: Math.max(0, prev.hp - enemy.damage) }));
        if (statsRef.current.hp <= 0) onGameOver(gameTimeRef.current);
      }

      // Blade Collision Check
      const segmentLenSq = Math.pow(bladeFullLength, 2);
      const t = Math.max(0, Math.min(1, ((enemy.x - px) * (bladeTipX - px) + (enemy.y - py) * (bladeTipY - py)) / (segmentLenSq || 1)));
      const projX = px + t * (bladeTipX - px);
      const projY = py + t * (bladeTipY - py);
      const distToBlade = Math.sqrt(Math.pow(enemy.x - projX, 2) + Math.pow(enemy.y - projY, 2));

      if (distToBlade < enemy.radius + statsRef.current.bladeWidth) {
        // Apply Damage
        enemy.hp -= statsRef.current.attackPower * (isStabbingRef.current ? 3 : 1) / 10;
        createParticles(enemy.x, enemy.y, enemy.color, 1);

        // Calculate Knockback: smaller radius = bigger knockback
        const knockDirX = enemy.x - projX;
        const knockDirY = enemy.y - projY;
        const knockDist = Math.sqrt(knockDirX * knockDirX + knockDirY * knockDirY) || 1;
        
        // Base knockback power
        const basePower = isStabbingRef.current ? 12 : 4;
        const massFactor = 20 / enemy.radius; // Smaller radius = higher multiplier
        const power = basePower * massFactor;

        enemy.vx += (knockDirX / knockDist) * power;
        enemy.vy += (knockDirY / knockDist) * power;

        // Death logic
        if (enemy.hp <= 0) {
          createParticles(enemy.x, enemy.y, enemy.color, 15);
          enemiesRef.current.splice(index, 1);
          onUpdateStats(prev => {
            const newXp = prev.xp + 10;
            if (newXp >= prev.nextLevelXp) setTimeout(onLevelUp, 0);
            return { ...prev, xp: newXp, killCount: prev.killCount + 1 };
          });
        }
      }
    });

    // Particle update
    particlesRef.current.forEach((p, idx) => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      if (p.life <= 0) particlesRef.current.splice(idx, 1);
    });

    // Cleanup
    if (enemiesRef.current.length > 200) {
      enemiesRef.current = enemiesRef.current.filter(e => {
        const d = Math.sqrt(Math.pow(e.x - px, 2) + Math.pow(e.y - py, 2));
        return d < 2500;
      });
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const camX = cameraRef.current.x;
    const camY = cameraRef.current.y;

    ctx.save();
    ctx.translate(centerX - camX, centerY - camY);

    // Grid
    ctx.strokeStyle = '#1e293b'; 
    ctx.lineWidth = 1;
    const gridSize = 100;
    const startX = Math.floor((camX - centerX) / gridSize) * gridSize;
    const endX = Math.ceil((camX + centerX) / gridSize) * gridSize;
    const startY = Math.floor((camY - centerY) / gridSize) * gridSize;
    const endY = Math.ceil((camY + centerY) / gridSize) * gridSize;

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
    }

    // Particles
    particlesRef.current.forEach(p => { 
      ctx.globalAlpha = p.life; 
      ctx.fillStyle = p.color; 
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill(); 
    });
    ctx.globalAlpha = 1;

    // Enemies
    enemiesRef.current.forEach(enemy => {
      ctx.shadowBlur = 10; ctx.shadowColor = enemy.color; ctx.fillStyle = enemy.color;
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2); ctx.fill();
      const barWidth = enemy.radius * 2;
      ctx.fillStyle = '#444'; ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, barWidth, 4);
      ctx.fillStyle = '#f87171'; ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, barWidth * (enemy.hp / enemy.maxHp), 4);
      ctx.shadowBlur = 0;
    });

    // Player
    const px = playerPosRef.current.x; 
    const py = playerPosRef.current.y;
    ctx.shadowBlur = 20; ctx.shadowColor = '#3b82f6'; ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2); ctx.fill();

    // Blade
    const bladeAngle = currentBladeAngleRef.current;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = statsRef.current.bladeWidth; ctx.lineCap = 'round'; ctx.shadowColor = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(px, py);
    const len = statsRef.current.bladeLength + stabOffsetRef.current;
    ctx.lineTo(px + Math.cos(bladeAngle) * len, py + Math.sin(bladeAngle) * len);
    ctx.stroke(); 
    ctx.shadowBlur = 0;

    ctx.restore();

    // Joysticks
    const drawJoystick = (js: JoystickState, color: string) => {
      if (!js.active) return;
      ctx.globalAlpha = 0.3; ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(js.base.x, js.base.y, 50, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(js.current.x, js.current.y, 25, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    };

    drawJoystick(moveJoystick.current, '#3b82f6');
    drawJoystick(aimJoystick.current, '#f472b6');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => { 
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight; 
    };
    
    const handleMouseMove = (e: MouseEvent) => { 
        mouseRef.current = { x: e.clientX, y: e.clientY }; 
    };
    
    const handleMouseDown = (e: MouseEvent) => {
        // Left click or any mouse click starts a stab
        isStabbingRef.current = true;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (gameState === GameState.PLAYING) e.preventDefault();
      
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.clientX < window.innerWidth / 2) {
          if (!moveJoystick.current.active) {
            moveJoystick.current = {
              active: true,
              base: { x: touch.clientX, y: touch.clientY },
              current: { x: touch.clientX, y: touch.clientY },
              vector: { x: 0, y: 0 },
              touchId: touch.identifier
            };
          }
        } else {
          if (!aimJoystick.current.active) {
            aimJoystick.current = {
              active: true,
              base: { x: touch.clientX, y: touch.clientY },
              current: { x: touch.clientX, y: touch.clientY },
              vector: { x: 0, y: 0 },
              touchId: touch.identifier
            };
            isStabbingRef.current = true; // Right side tap triggers stab
          }
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameState === GameState.PLAYING) e.preventDefault();
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const maxDist = 50;
        
        const updateJS = (js: React.MutableRefObject<JoystickState>) => {
          if (js.current.active && js.current.touchId === touch.identifier) {
            const dx = touch.clientX - js.current.base.x;
            const dy = touch.clientY - js.current.base.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            const clampedDist = Math.min(dist, maxDist);
            
            js.current.current = { x: js.current.base.x + Math.cos(angle) * clampedDist, y: js.current.base.y + Math.sin(angle) * clampedDist };
            js.current.vector = { x: (Math.cos(angle) * clampedDist) / maxDist, y: (Math.sin(angle) * clampedDist) / maxDist };
          }
        };

        updateJS(moveJoystick);
        updateJS(aimJoystick);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (moveJoystick.current.touchId === touch.identifier) {
          moveJoystick.current.active = false;
          moveJoystick.current.vector = { x: 0, y: 0 };
          moveJoystick.current.touchId = null;
        }
        if (aimJoystick.current.touchId === touch.identifier) {
          aimJoystick.current.active = false;
          aimJoystick.current.vector = { x: 0, y: 0 };
          aimJoystick.current.touchId = null;
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      update(dt); 
      draw(ctx);
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, onLevelUp, onGameOver, onUpdateStats]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 touch-none" />;
};

export default GameEngine;
