export class MainScene extends Phaser.Scene {
  protected player: Phaser.Physics.Arcade.Sprite;
  protected controls: Phaser.Cameras.Controls.FixedKeyControl;
  protected cursors: Phaser.Input.Keyboard.CursorKeys;
  protected showDebug: boolean = false;

  constructor() {
    super({ key: "MainScene" });
  }

  public preload(): void {
    this.load.image("redone", "assets/redone.png");
    this.load.image("tileset", "assets/0x72_DungeonTilesetII_v1.1.png");
    this.load.spritesheet("player", "assets/sprites/wizard.png", {
      frameWidth: 16,
      frameHeight: 22,
    });
    this.load.spritesheet("fireball", "assets/sprites/fireball.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.tilemapTiledJSON("map", "assets/level.json");
  }

  // Initial state for the scene
  public create(): void {

    window.addEventListener("resize", this.resize);
    this.resize();

    // Tilemap
    const map = this.make.tilemap({ key: "map" });

    // map tilemap coords with actual tileset
    // 1st is the tiled reference name then is the key of loaded image
    const tileset = map.addTilesetImage("redone", "redone");

    // Init layers defined in tiled
    const belowLayer = map.createStaticLayer("below", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("ground", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("above", tileset, 0, 0);

    // make player collide with what was defined in tiled as collides: true
    worldLayer.setCollisionByProperty({ collides: true });
    aboveLayer.setCollisionByProperty({ collides: true });

    // move the above layer above
    aboveLayer.setDepth(10);

    // locate spawn point
    const spawnPoint = map.findObject("objects", (obj) => obj.name === "spawn");
    // const spawnPoint = 160;

    // Create a sprite with physics enabled via the physics system. The image used for the sprite has
    // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.

    // @ts-ignore
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player");

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(this.player, worldLayer);
    this.physics.add.collider(this.player, aboveLayer);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player", {
        start: 4,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", {
        start: 4,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Set up the arrows to control the camera
    this.cursors = this.input.keyboard.createCursorKeys();

    // Help text that has a "fixed" position on the screen
    // this.add
    //   .text(12, 12, 'Arrow keys to move\nPress "D" to show hitboxes', {
    //     font: "11px monospace",
    //     fill: "#000000",
    //     padding: { x: 10, y: 5 },
    //     backgroundColor: "#ffffff",
    //   })
    //   .setScrollFactor(0).setDepth(15);

    // Debug graphics
    this.input.keyboard.once("keydown_D", (event) => {
      // Turn on physics debugging to show player's hitbox
      this.physics.world.createDebugGraphic();

      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);
      worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
      });
    });
  }

  // Updates the game frame ~ 60 fps
  public update(time, delta): void {
    const player = this.player;
    const cursors = this.cursors;

    const speed = 100;

    // Stop any previous movement from the last frame
    player.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
      player.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
      player.setVelocityX(speed);
    }

    // Vertical movement
    if (cursors.up.isDown) {
      player.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      player.setVelocityY(speed);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    player.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (cursors.left.isDown) {
      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.anims.play("right", true);
    } else {
      player.anims.play("idle", true);
    }
  }

  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wratio = width / height;
    const ratio = this.game.canvas.width / this.game.canvas.height;

    if (wratio < ratio) {
      this.game.canvas.style.width = width + "px";
      this.game.canvas.style.height = (width / ratio) + "px";
    } else {
      this.game.canvas.style.width = (height * ratio) + "px";
      this.game.canvas.style.height = height + "px";
    }

  }

}
