var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#ffffff',
    parent: 'Dots',

    physics:
    {
        default: "arcade", 
        arcade:
        {
            gravity: { y: 0 },
            debug: false
        }
    },

    scene: [Hexagon]


};

var game = new Phaser.Game(config);

function create() {
    //game.physics.startSystem(Phaser.Physics.ARCADE);
}
