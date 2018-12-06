export default class MenuScene extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];

    constructor() {
        super({
            key: "MenuScene",
        });
    }

    public init(): void {
        this.startKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER,
        );
        this.startKey.isDown = false;
    }

    public create(): void {
        this.bitmapTexts.push(
            this.add.bitmapText(
                this.sys.canvas.width / 2 - 135,
                this.sys.canvas.height / 2 - 80,
                "sans-serif",
                "IDK",
                40,
            ),
        );

        this.bitmapTexts.push(
            this.add.bitmapText(
                this.sys.canvas.width / 2 - 50,
                this.sys.canvas.height / 2 - 10,
                "sans-serif",
                "S: PLAY",
                30,
            ),
        );
    }

    public update(): void {
        if (this.startKey.isDown) {
            this.scene.start("DungeonScene");
        }
    }
}
