/**
 * Created by Skoll on 2015-12-17.
 */
var game = new Phaser.Game(1100, 400, Phaser.CANVAS, 'game', null, false, false);

var PhaserGame = function () {

    this.graphicScale = 2;
    this.player = null;
    this.platforms = null;
    this.facing = 'left';
    this.jumpTimer = 0;
    this.cursors = null;

    this.maxPlayerVelocity = 100;
    this.playerVelocity = 0;
    this.playerAccel = 400;
    this.distanceTraveled = 0;
    this.totalDistance = 1000000;

    this.bgLayer1Width = 1235;
    this.bgLayer2Width = 900;

    // this will display stats on screen.
    this.debugMode = true;
};

PhaserGame.prototype = {

    init: function () {
        this.game.renderer.renderSession.roundPixels = false;
        this.game.antialias = false;
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 800;
    },

    preload: function () {
        this.load.image('background', 'assets/images/background.png');
        this.load.image('base', 'assets/images/ice-platform.png');
        this.load.image('bgLayer1', 'assets/images/bg_layer1.png');
        this.load.image('bgLayer2', 'assets/images/bg_layer2.png');
        this.load.spritesheet('dude', 'assets/images/dude.png', 32, 48);
        //  Note: Graphics are Copyright 2015 Photon Storm Ltd.
    },

    create: function () {
        this.add.sprite(0, 0, 'background').scale.setTo(this.graphicScale,this.graphicScale);
        this.bgLayer2 = this.add.sprite(0, 0, 'bgLayer2').scale.setTo(this.graphicScale,this.graphicScale);
        this.bgLayer1 = this.add.sprite(0, 140, 'bgLayer1').scale.setTo(this.graphicScale,this.graphicScale);

/*        this.platforms = this.add.physicsGroup();

        this.platforms.create(0, 64, 'ice-platform');
        this.platforms.create(200, 180, 'platform');
        this.platforms.create(400, 296, 'ice-platform');
        this.platforms.create(600, 412, 'platform');

        this.platforms.setAll('body.allowGravity', false);
        this.platforms.setAll('body.immovable', true);
        this.platforms.setAll('body.velocity.x', 100);*/

        this.baseFloor = this.add.sprite(0, 368, 'base');
        //this.baseFloor.scale.setTo(this.graphicScale,this.graphicScale);

        this.player = this.add.sprite(320, 432, 'dude');
        this.player.scale.setTo(this.graphicScale,this.graphicScale);

        this.physics.arcade.enable(this.player);

        this.player.body.collideWorldBounds = true;
        this.player.body.setSize(40, 64, 0, 0);

        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('turn', [4], 20, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);
        this.player.play('right');

        this.cursors = this.input.keyboard.createCursorKeys();

        if(this.debugMode){
            this.accelerationText = game.add.text(8, 8, 'n/a', {fontSize: '14px', fill: '#FFF' });
            this.velocityText = game.add.text(50, 8, 'n/a', {fontSize: '14px', fill: '#FFF' });
            this.distanceText = game.add.text(100, 8, 'n/a', {fontSize: '14px', fill: '#FFF' });
        }

    },

    wrapPlatform: function (platform) {

        if (platform.body.velocity.x < 0 && platform.x <= -160) {
            platform.x = 640;
        } else if (platform.body.velocity.x > 0 && platform.x >= 640) {
            platform.x = -160;
        }
    },

    setFriction: function (player, platform) {
        if (platform.key === 'ice-platform') {
            player.body.x -= platform.body.x - platform.body.prev.x;
        }
    },

    update: function () {

        if(this.debugMode){
            this.velocityText.text = this.playerVelocity;
            this.accelerationText.text = this.playerAccel;
            this.distanceText.text = this.distanceTraveled;
        }

        //this.platforms.forEach(this.wrapPlatform, this);
        //this.physics.arcade.collide(this.player, this.platforms, this.setFriction, null, this);

        this.physics.arcade.collide(this.player, this.baseFloor, this.setFriction, null, this);

        //  Do this AFTER the collide check, or we won't have blocked/touching set
        var standing = this.player.body.blocked.down || this.player.body.touching.down;

        this.player.body.velocity.x = 0;
        this.player.body.position.x = 100+(this.playerVelocity/this.maxPlayerVelocity)*300;

        if (this.cursors.left.isDown) {
            if(this.playerVelocity > 0){
                this.playerVelocity -= 1;
            }
        } else if (this.cursors.right.isDown) {
            if(this.playerVelocity < this.maxPlayerVelocity){
                this.playerVelocity += 1;
            }
        }

        if(this.distanceTraveled < this.totalDistance){
            this.distanceTraveled += this.playerVelocity;
        }

        if (standing && this.cursors.up.isDown && this.time.time > this.jumpTimer) {
            this.player.body.velocity.y = -500;
            this.jumpTimer = this.time.time + 750;
        }
    }
};

game.state.add('Game', PhaserGame, true);
