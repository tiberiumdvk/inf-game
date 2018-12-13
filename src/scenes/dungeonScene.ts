// @ts-ignore
import Dungeon from "@mikewesthad/dungeon";

import Tiles from "../common/tileMapping";
import TilemapVisibility from "../common/tileVisibility";
import Player from "../objects/Player";

export default class DungeonScene extends Phaser.Scene {
  private level: number = 0;
  private reachedStairs: boolean = false;
  private dungeon: Dungeon;
  private player: Player;
  private fireballs: Phaser.Physics.Arcade.Group;
  private groundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
  private stuffLayer: Phaser.Tilemaps.DynamicTilemapLayer;
  private tilemapVisibility: TilemapVisibility;

  constructor() {
    super({ key: "DungeonScene" });
  }

  public preload(): void {
    this.load.spritesheet("mage", "assets/spritesheets/mage-48x64px.png", {
      frameWidth: 48,
      frameHeight: 64,
    });
    this.load.spritesheet("tiles", "assets/tilesets/buch-tileset-48px-extruded.png", {
      frameWidth: 48,
      frameHeight: 64,
    });
    // this.load.spritesheet("fireball", "assets/spritesheets/fireball-64x64px.png", {
    //   frameWidth: 64,
    // });
  }

  public create(): void {

    this.sound.stopAll();
    this.sound.play("soundtrack-extreme");

    this.resize();

    this.level++;
    this.reachedStairs = false;

    //  - Rooms should only have odd number dimensions so that they have a center tile.
    //  - Doors should be at least 2 tiles away from corners, so that we can place a corner tile on
    //    either side of the door location
    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 7, max: 15, onlyOdd: true },
        height: { min: 7, max: 15, onlyOdd: true },
      },
    });

    this.dungeon.drawToConsole();

    // Blank tilemap with dimensions matching the dungeon
    const map = this.make.tilemap({
      tileWidth: 48,
      tileHeight: 48,
      width: this.dungeon.width,
      height: this.dungeon.height,
    });

    const tileset = map.addTilesetImage("tiles", null, 48, 48, 1, 2); // 1px margin, 2px spacing
    this.groundLayer = map.createBlankDynamicLayer("Ground", tileset).fill(Tiles.BLANK);
    this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);
    const shadowLayer = map.createBlankDynamicLayer("Shadow", tileset).fill(Tiles.BLANK);

    this.tilemapVisibility = new TilemapVisibility(shadowLayer);

    this.dungeon.rooms.forEach((room) => {
      // tslint:disable-next-line
      const { x, y, width, height, left, right, top, bottom } = room;

      // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
      this.groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, Tiles.FLOOR);

      // Place the room corners tiles
      this.groundLayer.putTileAt(Tiles.WALL.TOP_LEFT, left, top);
      this.groundLayer.putTileAt(Tiles.WALL.TOP_RIGHT, right, top);
      this.groundLayer.putTileAt(Tiles.WALL.BOTTOM_RIGHT, right, bottom);
      this.groundLayer.putTileAt(Tiles.WALL.BOTTOM_LEFT, left, bottom);

      // Fill the walls with mostly clean tiles, but occasionally place a dirty tile
      this.groundLayer.weightedRandomize(left + 1, top, width - 2, 1, Tiles.WALL.TOP);
      this.groundLayer.weightedRandomize(left + 1, bottom, width - 2, 1, Tiles.WALL.BOTTOM);
      this.groundLayer.weightedRandomize(left, top + 1, 1, height - 2, Tiles.WALL.LEFT);
      this.groundLayer.weightedRandomize(right, top + 1, 1, height - 2, Tiles.WALL.RIGHT);

      const doors = room.getDoorLocations();

      for (const door of doors) {
        if (door.y === 0) {
          this.groundLayer.putTilesAt(Tiles.DOOR.TOP, x + door.x - 1, y + door.y);
        } else if (door.y === room.height - 1) {
          this.groundLayer.putTilesAt(Tiles.DOOR.BOTTOM, x + door.x - 1, y + door.y);
        } else if (door.x === 0) {
          this.groundLayer.putTilesAt(Tiles.DOOR.LEFT, x + door.x, y + door.y - 1);
        } else if (door.x === room.width - 1) {
          this.groundLayer.putTilesAt(Tiles.DOOR.RIGHT, x + door.x, y + door.y - 1);
        }
      }
    });

    // Randomize rooms
    const rooms = this.dungeon.rooms.slice();
    const startRoom = rooms.shift();
    const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);

    // Place the stairs
    // @ts-ignore
    this.stuffLayer.putTileAt(Tiles.STAIRS, endRoom.centerX, endRoom.centerY);

    // Place stuff in the 90% "otherRooms"
    otherRooms.forEach((room) => {
      const rand = Math.random();
      if (rand <= 0.25) {
        // 25% chance of chest
        this.stuffLayer.putTileAt(Tiles.CHEST, room.centerX, room.centerY);
      } else if (rand <= 0.5) {
        // 50% chance of a pot anywhere in the room
        const x = Phaser.Math.Between(room.left + 2, room.right - 2); // tslint:disable-line
        const y = Phaser.Math.Between(room.top + 2, room.bottom - 2); // tslint:disable-line
        this.stuffLayer.weightedRandomize(x, y, 1, 1, Tiles.POT);
      } else {
        // 25% of either 2 or 4 towers, depending on the room size
        if (room.height >= 9) {
          this.stuffLayer.putTilesAt(Tiles.TOWER, room.centerX - 1, room.centerY + 1);
          this.stuffLayer.putTilesAt(Tiles.TOWER, room.centerX + 1, room.centerY + 1);
          this.stuffLayer.putTilesAt(Tiles.TOWER, room.centerX - 1, room.centerY - 2);
          this.stuffLayer.putTilesAt(Tiles.TOWER, room.centerX + 1, room.centerY - 2);
        } else {
          this.stuffLayer.putTilesAt(Tiles.TOWER, room.centerX - 1, room.centerY - 1);
          this.stuffLayer.putTilesAt(Tiles.TOWER, room.centerX + 1, room.centerY - 1);
        }
      }
    });

    this.groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
    this.stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

    this.stuffLayer.setTileIndexCallback(Tiles.STAIRS, () => {
      this.stuffLayer.setTileIndexCallback(Tiles.STAIRS, null, null);
      this.reachedStairs = true;
      this.player.freeze();
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => {
        this.player.destroy();
        this.scene.restart();
      }, null);
    }, null);

    // Place the player in the first room
    const playerRoom = startRoom;
    const x = map.tileToWorldX(playerRoom.centerX);
    const y = map.tileToWorldY(playerRoom.centerY);
    this.player = new Player(this, x, y, "player");

    this.physics.add.collider(this.player.sprite, this.groundLayer);
    this.physics.add.collider(this.player.sprite, this.stuffLayer);

    const camera = this.cameras.main;

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(this.player.sprite);

    // firebally stuff WIP
    // this.fireballs = this.physics.add.group();
    // this.physics.add.collider(this.fireballs, this.stuffLayer, this.endFireball, null, this);
    // this.input.on("pointerdown", this.shoot, this);

    this.input.keyboard.once("keydown_D", (event) => {
      // Turn on physics debugging to show player's hitbox
      this.physics.world.createDebugGraphic();

      const graphics = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);
      this.groundLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255),
      });
    });

    // Help text that has a "fixed" position on the screen
    this.add
      .text(10, 10, `Current level: ${this.level}`,
        {
          font: "18px monospace",
          fill: "#000000",
          padding: { x: 20, y: 10 },
          backgroundColor: "#ffffff",
        },
      )
      .setScrollFactor(0);
  }

  public update(time, delta) {
    if (this.reachedStairs) {
      return;
    }

    this.player.update();

    const playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x);
    const playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y);
    const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);

    this.tilemapVisibility.setActiveRoom(playerRoom);

    if (this.player.health <= 0) {
      this.sound.play("soundtrack-extreme");
    }
  }

  private shoot(pointer) {
    const fireball = this.fireballs.get(pointer.x, pointer.y);
    if (fireball) {
      fireball.setActive(true);
      fireball.setVisible(true);
      fireball.body.velocity.y = -200;
    }
  }

  // LOL
  private endFireball(wall: Phaser.Tilemaps.DynamicTilemapLayer, fireball: Phaser.GameObjects.GameObject): any {
    fireball.destroy();
  }

  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wratio = width / height;
    const ratio = this.sys.game.canvas.width / this.sys.game.canvas.height;

    if (wratio < ratio) {
      this.sys.game.canvas.style.width = width + "px";
      this.sys.game.canvas.style.height = width / ratio + "px";
    } else {
      this.sys.game.canvas.style.width = height * ratio + "px";
      this.sys.game.canvas.style.height = height + "px";
    }
  }
}
