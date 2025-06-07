# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

This is a pure client-side HTML5 tank game with no build process or dependencies.

To run:
- **Windows**: Double-click `高级启动器.bat` for an interactive launcher
- **Any platform**: Open `index.html` directly in a modern browser

## Architecture Overview

The game uses a modular object-oriented architecture with clear separation of concerns:

- **game-main.js**: Core game controller (`TankGame` class) managing the game loop, collision detection, rendering, and object pools
- **tank.js**: Tank entities with AI support, health system (100 HP), and separate body/turret rotation
- **bullet.js**: Projectile system with visual trail effects
- **game-utils.js**: Supporting classes:
  - `Obstacle`: Destructible environment (wood: 1 hit, stone: 3 hits, steel: 5 hits)
  - `Particle`: Physics-based explosion effects
  - `ObjectPool`: Performance optimization for bullets/particles
  - `InputManager`: Keyboard input handling (Player 1: WASD+Space, Player 2: Arrows+Enter)
  - `GameModeManager`: Single/multiplayer mode switching

## Key Game Systems

1. **AI System**: Three difficulty levels (easy/normal/hard) affecting speed, accuracy, and tactical decisions
2. **Health System**: Each tank has 100 HP, takes 20 damage per hit
3. **Scoring**: 100 points per successful hit
4. **Game Modes**: Toggle with F1 (single/multiplayer), F2 (AI difficulty)

## Development Notes

- No build tools, package manager, or testing framework
- Uses modern ES6+ JavaScript features (classes, arrow functions, template literals)
- All game logic runs client-side using HTML5 Canvas
- Object pooling implemented for performance optimization
- The `.bat` file provides Windows users with file integrity checks and troubleshooting options