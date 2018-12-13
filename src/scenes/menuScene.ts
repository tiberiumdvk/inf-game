export default class MenuScene extends Phaser.Scene {
    private logo: Phaser.GameObjects.Image;
    private playButton: Phaser.GameObjects.Text;
    private settingsButton: Phaser.GameObjects.Text;
    private selectionHighlight: Phaser.GameObjects.Image;

    constructor() {
        super({
            key: "MenuScene",
        });
    }

    public preload(): void {
        this.load.image("selection", "assets/ui/Highlight.png");
        this.load.image("logo", "assets/logo/PrinceOfIndiaLogo.png");
        this.load.audio("soundtrack", "assets/audio/soundtrack/soundtrack.wav");
        this.load.audio("soundtrack-extreme", "assets/audio/soundtrack/soundtrack-extreme.wav");
    }

    public create(): void {
        const centerX = this.sys.canvas.width / 2;
        let itemOffset = 100;

        this.logo = this.add.image(0, 0, "logo");
        this.logo.x = centerX;
        this.logo.y = itemOffset;
        itemOffset += this.logo.height / 4;
        this.logo.setScale(0.5, 0.5);

        this.selectionHighlight = this.add.image(110, 110, "selection");
        this.selectionHighlight.setScale(0.35, 0.35);
        this.selectionHighlight.setVisible(false);

        this.playButton = this.add.text(0, 0, "PLAY");
        this.playButton.x = centerX - 30;
        this.playButton.y = itemOffset;
        this.playButton.setFontSize(34);
        itemOffset += this.playButton.height + 100;
        this.playButton.setInteractive()
        .on("pointerover", () => {
            this.selectionHighlight.x = this.playButton.x + 38;
            this.selectionHighlight.y = this.playButton.y + 15;

            if (!this.selectionHighlight.visible) {
                this.selectionHighlight.setVisible(true);
            }
        })
        .on("pointerout", () => this.selectionHighlight.setVisible(false))
        .on("pointerdown", () => this.scene.run("DungeonScene"));

        this.settingsButton = this.add.text(0, 0, "SETTINGS");
        this.settingsButton.x = centerX - 65;
        this.settingsButton.y = itemOffset;
        this.settingsButton.setFontSize(34);
        this.settingsButton.setInteractive()
        .on("pointerover", () => {
            this.selectionHighlight.x = this.settingsButton.x + 65;
            this.selectionHighlight.y = this.settingsButton.y + 15;

            if (!this.selectionHighlight.visible) {
                this.selectionHighlight.setVisible(true);
            }
        })
        .on("pointerout", () => this.selectionHighlight.setVisible(false))
        .on("pointerdown", () => alert("nie ma jescze we typie na spokonie k ?"));

        this.sound.play("soundtrack");
    }
}
