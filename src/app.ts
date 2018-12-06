import "./inf-game.d.ts";
import "./phaser.d.ts";

import "phaser";

// This is how we should import css/static files otherwise typescript gets mad
// also 'styles' maps to the styles dir outside of src
// same goes for 'assets'
require("styles/app.css");

import DungeonScene from "./scenes/dungeonScene";

// main game configuration
const config: GameConfig = {
  width: 1280,
  height: 720,
  parent: "game",
  physics: {
    arcade: {
      gravity: { y: 0 },
    },
    default: "arcade",
  },
  scene: DungeonScene,

  // @ts-ignore
  pixelArt: true,
  type: Phaser.AUTO,
};

// Global game class
export class Game extends Phaser.Game {
  constructor(gameConfig: GameConfig) {
    super(gameConfig);
  }
}

// When the page is loaded, create the game instance
window.onload = () => {
  const game = new Game(config);
};
