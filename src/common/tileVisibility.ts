export default class TilemapVisibility {
    private activeRoom;
    private shadowLayer;

    constructor(shadowLayer) {
        this.shadowLayer = shadowLayer;
        this.activeRoom = null;
    }

    public setActiveRoom(room) {
        if (room !== this.activeRoom) {
            this.setRoomAlpha(room, 0); // Make the new room visible
            if (this.activeRoom) { this.setRoomAlpha(this.activeRoom, 0.5); } // Dim the old room
            this.activeRoom = room;
        }
    }

    // Helper to set the alpha on all tiles within a room
    public setRoomAlpha(room, alpha) {
        this.shadowLayer.forEachTile(
            (t) => (t.alpha = alpha),
            this,
            room.x,
            room.y,
            room.width,
            room.height,
        );
    }
}
