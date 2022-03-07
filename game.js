var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    parent: 'Dots',
    dom: {
        createContainer: true
    },

    physics:
    {
        default: "arcade", 
        arcade:
        {
            gravity: { y: 0 },
            debug: false
        }
    },

    scene: [Level]


};

var game = new Phaser.Game(config);

function create() {
    //game.physics.startSystem(Phaser.Physics.ARCADE);
}
