export default class Player extends Phaser.GameObjects.Sprite {
    public health: number;
    public sprite: Phaser.Physics.Arcade.Sprite;
    private keys: Phaser.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: integer, y: integer, key: string, frame?: string | number) {
        super(scene, x, y, key, frame);

        const anims = scene.anims;
        anims.create({
            key: "player-walk-left",
            frames: anims.generateFrameNumbers("mage", { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1,
        });
        anims.create({
            key: "player-walk-down",
            frames: anims.generateFrameNumbers("mage", { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });
        anims.create({
            key: "player-walk-right",
            frames: anims.generateFrameNumbers("mage", { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });
        anims.create({
            key: "player-walk-up",
            frames: anims.generateFrameNumbers("mage", { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1,
        });

        this.sprite = scene.physics.add
            .sprite(x, y, "mage", 0)
            .setSize(22, 33)
            .setOffset(23, 27);

        this.sprite.anims.play("player-walk-down");

        this.keys = scene.input.keyboard.createCursorKeys();
    }

    public freeze() {
        // @ts-ignore
        this.sprite.body.moves = false;
    }

    public update() {
        const keys = this.keys;
        const sprite = this.sprite;
        const speed = 300;
        const prevVelocity = sprite.body.velocity.clone();

        // Stop any previous movement from the last frame
        // @ts-ignore
        sprite.body.setVelocity(0);

        // Horizontal movement
        if (keys.left.isDown) {
            // @ts-ignore
            sprite.body.setVelocityX(-speed);
        } else if (keys.right.isDown) {
            // @ts-ignore
            sprite.body.setVelocityX(speed);
        }

        // Vertical movement
        if (keys.up.isDown) {
            // @ts-ignore
            sprite.body.setVelocityY(-speed);
        } else if (keys.down.isDown) {
            // @ts-ignore
            sprite.body.setVelocityY(speed);
        }

        // Normalize speed and scale the velocity
        sprite.body.velocity.normalize().scale(speed);

        // Update the animation last and give left/right animations precedence over up/down animations
        if (keys.left.isDown) {
            sprite.anims.play("player-walk-left", true);
        } else if (keys.right.isDown) {
            sprite.anims.play("player-walk-right", true);
        } else if (keys.down.isDown) {
            sprite.anims.play("player-walk-down", true);
        } else if (keys.up.isDown) {
            sprite.anims.play("player-walk-up", true);
        } else {
            sprite.anims.stop();

            // If we were moving, pick and idle frame to use
            if (prevVelocity.y < 0) {
                sprite.setTexture("mage", 1);
            } else {
                sprite.setTexture("mage", 7);
            }
        }
    }

    public destroy() {
        this.sprite.destroy();
    }
}
