/**
 * Created by Skoll on 2015-12-17.
 */
var game = new Phaser.Game(1100, 400, Phaser.CANVAS, 'game', null, false, false);

var PhaserGame = function () {

    this.cameraWidth = 1100/2;
    this.cameraHeight = 400/2;
    this.uiView = {
        x: 0,
        y: 0
    };

    this.graphicScale = 2;
    this.player = null;
    this.platforms = null;
    this.facing = 'left';
    this.jumpTimer = 0;
    this.cursors = null;

    this.drag = 50;

    this.maxPlayerVelocity = 1000;
    this.playerVelocity = 0;
    this.playerAccel = 0;
    this.maxPlayerAccel = 1000;
    this.distanceTraveled = 0;
    this.totalDistance = 100000;
    this.worldStartMargin = 500;
    this.worldEndMargin = 1000;
    this.actualDistance = this.totalDistance+this.worldStartMargin+this.worldEndMargin;

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
        this.bgLayer2 = this.add.sprite(0, 0, 'bgLayer2');
        this.bgLayer2.scale.setTo(this.graphicScale,this.graphicScale);
        this.bgLayer1 = this.add.sprite(0, 140, 'bgLayer1');
        this.bgLayer1.scale.setTo(this.graphicScale,this.graphicScale);
        this.world.setBounds(0,0,this.actualDistance,400);

        //this.baseFloor = this.add.sprite(0, 368, 'base');
        this.baseFloor = this.add.tileSprite(0, 368, this.actualDistance, 32 , 'base');
        //this.baseFloor.scale.setTo(this.graphicScale,this.graphicScale);

        // player setup
        this.player = this.add.sprite(this.worldStartMargin, 432, 'dude');
        this.player.scale.setTo(this.graphicScale,this.graphicScale);

        // body physics won't work without this!!
        this.physics.arcade.enable(this.player);

        this.player.body.drag.x = this.drag;
        //this.player.body.friction.x = 50;
        this.player.body.maxVelocity.x = this.maxPlayerVelocity;

        this.player.body.collideWorldBounds = true;
        this.player.body.setSize(40, 64, 0, 0);

        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('turn', [4], 20, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);
        this.player.play('right');

        this.cursors = this.input.keyboard.createCursorKeys();

        if(this.debugMode){
            this.accelerationText = game.add.text(8, 8, 'n/a', {fontSize: '14px', fill: '#FFF' });
            this.velocityText = game.add.text(58, 8, 'n/a', {fontSize: '14px', fill: '#FFF' });
            this.distanceText = game.add.text(108, 8, 'n/a', {fontSize: '14px', fill: '#FFF' });
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

        this.uiView.x = this.game.camera.x;// - this.cameraWidth;
        this.uiView.y = this.game.camera.y;// - this.cameraHeight;

        if(this.debugMode){
            this.accelerationText.x = this.uiView.x + 8;
            this.accelerationText.text = Math.round(this.player.body.acceleration.x);
            this.velocityText.x = this.uiView.x + 58;
            this.velocityText.text = Math.round(this.player.body.velocity.x);
            this.distanceText.x = this.uiView.x + 108;
            this.distanceText.text = Math.round(this.player.body.position.x);
        }

        //this.platforms.forEach(this.wrapPlatform, this);
        //this.physics.arcade.collide(this.player, this.platforms, this.setFriction, null, this);

        this.physics.arcade.collide(this.player, this.baseFloor, this.setFriction, null, this);

        //  Do this AFTER the collide check, or we won't have blocked/touching set
        var standing = this.player.body.blocked.down || this.player.body.touching.down;

        //this.player.body.velocity.x = 0;
        //this.player.body.position.x = 100+(this.playerVelocity/this.maxPlayerVelocity)*300;

        //TODO:: make these static
        //this.bgLayer1.position.x = -1 * this.bgLayer1Width * (this.distanceTraveled/this.totalDistance);
        //this.bgLayer2.position.x = -1 * this.bgLayer2Width * (this.distanceTraveled/this.totalDistance);

        if (this.cursors.left.isDown) {
            // nothing.
            if(this.player.body.acceleration.x > -1 * this.maxPlayerAccel){
                this.player.body.acceleration.x -= 50;
            }
        } else if (this.cursors.right.isDown) {
            // nothing.
            this.player.body.acceleration.x = 6000;
        } else {
            this.player.body.acceleration.x = 0;
        }

        /*if (this.player.body.velocity.x > 0){
            this.player.body.velocity.x -= 5;
        } else if (this.player.body.velocity.x < this.maxPlayerVelocity){
            this.player.body.velocity.x += 5;
        }*/

        // camera should follow player and offset depending on the distance traveled.
        this.game.camera.x = this.player.body.x - this.cameraWidth + (400 - (this.player.body.velocity.x/this.maxPlayerVelocity)*300);

        /*if(this.distanceTraveled < this.totalDistance){
            this.distanceTraveled += this.playerVelocity;
        }*/

        if (standing && this.cursors.up.isDown && this.time.time > this.jumpTimer) {
            this.player.body.velocity.y = -500;
            this.jumpTimer = this.time.time + 750;
        }
    }
};

game.state.add('Game', PhaserGame, true);
