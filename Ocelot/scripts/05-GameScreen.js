Screen.GameScreen = function (game) {
    this.game = game;
};

Screen.GameScreen.prototype = {
    create: function () {
        Utils.GlobalSettings.save();
        this.screenShake = this.game.plugins.add(Phaser.Plugin.ScreenShake);
        this.setup();
        this.game.add.sprite(0, 0, '');
    },    

    setup: function () {
        this.clickSnd = this.game.add.audio('click');
        this.blipSnd = this.game.add.audio('blip');
        this.dripSnd = this.game.add.audio('drip');
        this.bombSnd = this.game.add.audio('explosion');

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.colors = Phaser.Color.HSVColorWheel();
        this.colorIndex = 0;
        this.bg = this.game.add.image(0, 0, 'bg');
        //this.bg.tint = Utils.GlobalSettings.getHexValue(this.colors[this.game.rnd.integerInRange(0, this.colors.length - 1)]);
        this.bg.alpha = 0.2;

        this.scoreText = this.game.add.bitmapText(20, Utils.GlobalSettings.height - 80, 'fader', '0', 72);
        this.score = 0;
        this.scoreBuffer = 0;
        this.actualScore = 0;

        var i;
        var spr;
        this.cloudPool = this.game.add.group();
        for (i = 0; i < 10; i++) {
            spr = this.cloudPool.create(this.game.rnd.integerInRange(-100, Utils.GlobalSettings.width + 100), this.game.rnd.integerInRange(-50, Utils.GlobalSettings.height - 100), 'clouds');
            spr.frame = this.game.rnd.integerInRange(0, 8);
            spr.alpha = this.game.rnd.realInRange(0.1, 0.3);
            spr._xspeed = this.game.rnd.realInRange(-0.3, 0.3);
            spr._yspeed = this.game.rnd.realInRange(1.2, 1.4);
            spr._curYSpeed = 0;
            spr.scale.set(this.game.rnd.realInRange(0.5, 2));
        }

        this.player = this.game.add.sprite(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2 + 100, 'ocelot');
        this.player.anchor.set(0.5, 0.5);
        if (Utils.GlobalSettings.isMobile) {
            this.player.inputEnabled = true;
            this.player.events.onInputDown.addOnce(this.switchOcelot.bind(this));
        }

        this.animalPool = this.game.add.physicsGroup();
        for (i = 0; i < 20; i++) {
            spr = this.animalPool.create(this.game.rnd.integerInRange(0, Utils.GlobalSettings.width - 64), -64, 'animals');
            spr.width = 50;
            spr.height = 50;
            spr.kill();
        }

        this.animalEffectPool = this.game.add.group();
        for (i = 0; i < 20; i++) {
            spr = this.animalEffectPool.create(0, 0, 'animals');
            spr.width = 50;
            spr.height = 50;
            spr.kill();
        }

        this.bombEffectPool = this.game.add.group();
        for (i = 0; i < 20; i++) {
            spr = this.bombEffectPool.create(0, 0, 'exp');
            spr.width = 50;
            spr.height = 50;
            spr.animations.add('boom', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);            
            spr.kill();
        }

        //this.flare = this.game.add.sprite(this.player.x-29, this.player.y+110, 'flare');
        //this.flare.anchor.set(0.5, 0.5);
        //this.flare.animations.add('flare');
        //this.flare.play('flare', 60, true);

        this.emitter = this.game.add.emitter(this.player.x - 26, this.player.y + 70, 100);

        this.emitter.makeParticles('fire', [0,1,2,3]);
        this.emitter.gravity = 2000;
        this.emitter.setScale(0.1, 0.5);
        this.emitter.start(false, 200, 0);

        this.bmd = this.game.add.bitmapData(Utils.GlobalSettings.width, Utils.GlobalSettings.height);
        //this.geomSprite = this.game.add.sprite(0, 0, this.bmd);
        this.bmd.cls();
        this.bmd.addToWorld();

        this.net = this.game.add.sprite(0, 0, 'net');
        this.net.anchor.set(0.5, 0.5);
        this.net.visible = false;
        this.game.physics.enable(this.net, Phaser.Physics.ARCADE);

        this.cannonStartPos = { x: -1, y: -1 };
        this.angle = 0;
        this.length = 0;
        this.radius = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.animalTimer = null;
        this.score = 0;

        this.gameoverImg = this.game.add.image(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2, 'gameover');
        this.gameoverImg.anchor.set(0.5, 0.5);
        this.gameoverImg.visible = false;

        this.restartButton = this.game.add.button(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2 + 100, 'restart', null, this, 1, 0, 1);
        this.restartButton.anchor.setTo(0.5);
        this.restartButton.visible = false;
        this.restartButton.events.onInputDown.addOnce(this.restartClick.bind(this));
        
        this.soundButton = null;
        if (!Utils.GlobalSettings.muted) {
            this.soundButton = this.game.add.button(Utils.GlobalSettings.width - 120, 5, 'systembuttons', null, this, 7, 6, 7);
        }
        else {
            this.soundButton = this.game.add.button(Utils.GlobalSettings.width - 120, 5, 'systembuttons', null, this, 9, 8, 9);
        }
        this.soundButton.width = 50;
        this.soundButton.height = 50;
        this.soundButton.events.onInputDown.addOnce(this.soundClick.bind(this));
        this.stopMusicOnLoad = false;

        this.exitButton = this.game.add.button(Utils.GlobalSettings.width - 60, 5, 'systembuttons', null, this, 5, 4, 5);
        this.exitButton.width = 50;
        this.exitButton.height = 50;
        this.exitButton.events.onInputDown.addOnce(this.exitClick.bind(this));

        if (navigator.isCocoonJS) {
            this.exitHandler = this.exitClick.bind(this);
            document.addEventListener("backbutton", this.exitHandler, false);
        }

        if (!Utils.GlobalSettings.isMobile) {
            this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); };            
        }

        this.game.input.onDown.addOnce(this.cannonStart, this);
        this.game.input.onUp.addOnce(this.cannonEnd, this);

        this.firstTime = Utils.GlobalSettings.firstTime;
        if (this.firstTime) {
            this.tutorialText = this.game.add.bitmapText(0, Utils.GlobalSettings.height / 2 - 300, 'mecha', "", 20);
            Utils.GlobalSettings.firstTime = false;
            Utils.GlobalSettings.save();

            this.doTutorial(0);
        }
        else {
            this.start();
        }
    },

    switchOcelot: function () {
        this.player.frame++;
        if (this.player.frame > 1) {
            this.player.frame = 0;
        }

        this.player.events.onInputDown.removeAll();
        this.player.events.onInputDown.addOnce(this.switchOcelot.bind(this));
    },

    doTutorial: function (step) {
        switch (step) {
            case 0:
                if (!Utils.GlobalSettings.isMobile) {
                    this.tutorialText.setText("Tutorial: Left-click, drag and release to catch the animals..");
                }
                else {
                    this.tutorialText.setText("Tutorial: Touch anywhere, drag and release to catch the animals..");
                }
                this.tutorialText.updateTransform();
                this.tutorialText.position.x = Utils.GlobalSettings.width / 2 - this.tutorialText.textWidth / 2;
                this.tutorialText.alpha = 0;

                this.animalTimer = this.game.time.events.add(3000, this.launchAnimal.bind(this, 0));

                var tween = this.game.add.tween(this.tutorialText).to({ alpha: 1, y: Utils.GlobalSettings.height / 2 - 200 }, 5000, Phaser.Easing.Linear.Out)
                                                                .to({ alpha: 0 }, 5000, Phaser.Easing.Linear.Out);
                tween.start();
                tween.onComplete.add(function () {
                    this.doTutorial(1);
                }, this);
                
                break;

            case 1:
                if (!Utils.GlobalSettings.isMobile) {
                    this.tutorialText.setText("Tutorial: Right-click, drag and release to destroy bombs..");
                }
                else {
                    this.tutorialText.setText("Tutorial: Tap player to switch your Ocelot Twin\nTouch anywhere, drag and release to destroy bombs..");
                }
                this.tutorialText.updateTransform();
                this.tutorialText.position.x = Utils.GlobalSettings.width / 2 - this.tutorialText.textWidth / 2;
                this.tutorialText.alpha = 0;

                this.animalTimer = this.game.time.events.add(3000, this.launchAnimal.bind(this, 10));

                var tween = this.game.add.tween(this.tutorialText).to({ alpha: 1, y: Utils.GlobalSettings.height / 2 - 200 }, 5000, Phaser.Easing.Linear.Out)
                                                                .to({ alpha: 0 }, 5000, Phaser.Easing.Linear.Out);
                tween.start();
                tween.onComplete.add(function () {
                    this.doTutorial(2);
                }, this);

                break;

            case 2:
                this.tutorialText.setText("Tutorial: Grey Ocelot destroys bombs and Orange Ocelot catches animals\nDon't catch bombs and don't let animals or bombs reach the bottom..");
                this.tutorialText.updateTransform();
                this.tutorialText.position.x = Utils.GlobalSettings.width / 2 - this.tutorialText.textWidth / 2;
                this.tutorialText.alpha = 0;

                this.game.time.events.add(100, this.launchAnimal.bind(this, 1));
                this.game.time.events.add(500, this.launchAnimal.bind(this, 10));
                this.game.time.events.add(1000, this.launchAnimal.bind(this, 2));

                var tween = this.game.add.tween(this.tutorialText).to({ alpha: 1, y: Utils.GlobalSettings.height / 2 - 200 }, 5000, Phaser.Easing.Linear.Out)
                                                                .to({ alpha: 0 }, 5000, Phaser.Easing.Linear.Out);
                tween.start();
                tween.onComplete.add(function () {
                    this.start();
                }, this);

                break;
        }
    },

    restartClick: function () {
        this.restartButton.events.onInputDown.removeAll();
        this.restartButton.events.onInputDown.addOnce(this.restartClick.bind(this));

        this.game.state.start('gamescreen');
    },

    doGameOver: function () {
        this.gameOver = true;
        Utils.GlobalSettings.timesPlayed++;

        //if (navigator.isCocoonJS) {
        //    this.screenTop = 110;
        //    this.barBackStart.y = this.screenTop;
        //    this.barBackMid.y = this.screenTop;
        //    this.barBackEnd.y = this.screenTop;
        //    this.barStart.y = this.screenTop;
        //    this.barMid.y = this.screenTop;
        //    this.barEnd.y = this.screenTop;
        //    this.scoreText.y = this.screenTop + 30;
        //    this.coinsText.y = this.scoreText.y + 70;
        //    this.coinIcon.y = this.coinsText.y;
        //    this.soundButton.y = this.screenTop;
        //    this.exitButton.y = this.screenTop;

        //    if (Utils.adManager.banner && Utils.adManager.bannerLoaded) {
        //        Utils.adManager.banner.show();
        //    }
        //}


        this.gameoverImg.visible = true;
        this.gameoverImg.alpha = 0;
        var tween1 = this.game.add.tween(this.gameoverImg).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, true);

        var tween2 = this.game.add.tween(this.player).to({ y: Utils.GlobalSettings.height + 500, rotation: Math.PI * 6 }, 5000, Phaser.Easing.Sinusoidal.Out, true);
        this.emitter.kill();
        this.emitter.visible = false;


        this.restartButton.visible = true;
        this.restartButton.scale.setTo(0);

        var restartTween = this.game.add.tween(this.restartButton.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Back.Out, true, 1000);
        var restartSpinTween = this.game.add.tween(this.restartButton).to({ angle: 360 }, 5000, Phaser.Easing.Linear.Out, true);
        restartSpinTween.loop();
        
        this.submitScore();
    },

    start: function () {
        this.gameStarted = true;
        this.firstTime = false;
        for (var i = 0; i < 20; i++) {
            this.animalTimer = this.game.time.events.add(3000 * i, this.launchAnimal.bind(this));
        }
    },

    launchAnimal: function (frame) {
        if (!this.gameOver) {
            var spr = this.animalPool.getFirstDead();
            if (spr) {
                spr.reset(this.game.rnd.integerInRange(50, Utils.GlobalSettings.width - 100), this.game.rnd.integerInRange(-50, -200));
                spr.revive();
                spr.anchor.set(0.5, 0.5);
                spr.body.setSize(50, 50, 0, 0);
                spr.body.velocity.x = 0;//this.game.rnd.integerInRange(-100, 100);
                spr.body.velocity.y = this.game.rnd.integerInRange(20, 100);
                spr.body.drag.x = 10;
                spr.body.angularAcceleration = this.game.rnd.integerInRange(-20, 20);
                spr.body.enable = true;
                spr.tint = 0xffffff;
                if (frame) {
                    spr.frame = frame;
                }
                else {
                    spr.frame = this.game.rnd.integerInRange(0, 11);
                }
            }

            //if (this.game.rnd.integerInRange(0, 1000) > 750) {
            //    spr = this.coinPool.getFirstDead();
            //    if (spr) {
            //        spr.reset(this.game.rnd.integerInRange(64, Utils.GlobalSettings.width - 64), this.game.rnd.integerInRange(-64, -200));
            //        spr.revive();
            //        spr.body.setSize(64, 64, 0, 0);
            //        spr.body.velocity.x = 0;
            //        spr.body.velocity.y = 80;
            //        spr.body.drag.x = 10;
            //        spr.body.enable = true;
            //        spr.animations.play('spin', 15, true);
            //    }
            //}
        }
    },

    doAnimalEffect: function (animal) {
        if (!this.gameOver) {
            var spr = this.animalEffectPool.getFirstDead();
            if (spr) {
                spr.reset(animal.x, animal.y);
                spr.revive();
                spr.anchor.set(0.5, 0.5);
                spr.tint = 0xffffff;
                spr.frame = animal.frame;
                spr.rotation = animal.rotation;
                spr.scale.x = 1;
                spr.scale.y = 1;
                spr.visible = true;
                var tween1 = this.game.add.tween(spr).to({ x: this.player.x, y: this.player.y, rotation: Math.PI * 6 }, 1000, Phaser.Easing.Back.In, true);
                var tween2 = this.game.add.tween(spr.scale).to({ x: 0, y: 0 }, 1000, Phaser.Easing.Back.In, true);
                tween2.onComplete.add(this.animalEffectDone.bind(this, spr), this);

                if (animal.frame === 10) {
                    tween1.onComplete.add(this.doBombEffect.bind(this, spr, true), this);                    
                }
                else {
                }

                if (!Utils.GlobalSettings.muted) {
                    this.dripSnd.play();
                }
            }
        }
    },

    animalEffectDone: function (animal) {
        animal.kill();
        animal.visible = false;

        if (animal.frame < 10) {
            this.actualScore += 100;
            this.scoreBuffer = this.actualScore;
        }
    },

    doBombEffect: function (bomb, killPlayer) {
        if (!this.gameOver) {
            var spr = this.bombEffectPool.getFirstDead();
            if (spr) {
                spr.reset(bomb.x, bomb.y);
                spr.revive();
                spr.anchor.set(0.5, 0.5);
                spr.tint = 0xffffff;
                spr.scale.x = 1;
                spr.scale.y = 1;
                spr.visible = true;
                spr.animations.play('boom', 20, false, true);
                //var tween1 = this.game.add.tween(spr).to({ x: this.player.x, y: this.player.y, rotation: Math.PI * 6 }, 1000, Phaser.Easing.Back.In, true);
                var tween1 = this.game.add.tween(spr.scale).to({ x: 2, y: 2 }, 200, Phaser.Easing.Back.In, true);
                //tween2.onComplete.add(this.animalEffectDone.bind(this, spr), this);

                if (this.screenShake) {
                    this.screenShake.shake(20);
                }

                if (!Utils.GlobalSettings.muted) {
                    this.bombSnd.play();
                }
            }

            if (killPlayer) {
                this.doGameOver();
            }
        }
    },

    updateAnimal: function (animal) {
        if (!this.gameOver) {
            if (animal) {
                if (animal.y >= 0 && (!animal.inWorld || animal.y > Utils.GlobalSettings.height + 50)) {
                    if (!animal.inWorld || animal.y > Utils.GlobalSettings.height + 50) {
                        for (var i = 0; i < 11; i++) {
                            var spr = this.bombEffectPool.getFirstDead();
                            if (spr) {
                                spr.reset(i * 64, Utils.GlobalSettings.height-32);
                                spr.revive();
                                spr.anchor.set(0.5, 0.5);
                                spr.tint = 0xffffff;
                                spr.scale.x = 1;
                                spr.scale.y = 1;
                                spr.visible = true;
                                spr.animations.play('boom', 20, false, true);
                                //var tween1 = this.game.add.tween(spr).to({ x: this.player.x, y: this.player.y, rotation: Math.PI * 6 }, 1000, Phaser.Easing.Back.In, true);
                                var tween1 = this.game.add.tween(spr.scale).to({ x: 2, y: 2 }, 200, Phaser.Easing.Back.In, true);
                                //tween2.onComplete.add(this.animalEffectDone.bind(this, spr), this);

                                if (this.screenShake) {
                                    this.screenShake.shake(20);
                                }

                                if (!Utils.GlobalSettings.muted) {
                                    this.bombSnd.play();
                                }
                            }
                        }
                        this.doGameOver();
                    }

                    animal.kill();
                    animal.body.velocity.x = 0;
                    animal.body.velocity.y = 0;
                    animal.body.drag.x = 0;
                    animal.body.x = -100;
                    animal.body.y = -100;
                    animal.body.enable = false;
                    this.animalTimer = this.game.time.events.add(1000, this.launchAnimal.bind(this));
                }
                else {
                }
            }
        }
    },

    updateNet: function () {
        if (!this.gameOver) {
            if (this.net) {
                if (this.net.x > Utils.GlobalSettings.width || this.net.x + this.net.width < 0 || this.net.y > Utils.GlobalSettings.height || this.net.y + this.net.height < 0) {
                    this.net.kill();
                    this.net.body.velocity.x = 0;
                    this.net.body.velocity.y = 0;
                    this.net.body.drag.x = 0;
                    this.net.body.x = -100;
                    this.net.body.y = -100;
                    this.net.body.enable = false;
                }
            }
        }
    },

    cannonStart: function () {
        if (!this.gameOver) {

            if (!Utils.GlobalSettings.muted) {
                this.clickSnd.play();
            }

            if (!Utils.GlobalSettings.isMobile) {
                var button = 0;
                if (this.game.device.ie) {
                    button = this.game.input.mspointer.button;
                }
                else {
                    button = this.game.input.mouse.button;
                }

                if (button === 0) {
                    this.player.frame = 0;
                    this.net.tint = 0xffffff;
                }
                else {
                    this.player.frame = 1;
                    this.net.tint = 0xff0000;
                }
            }
            else {
                if (this.player.frame === 0) {
                    this.net.tint = 0xffffff;
                }
                else {
                    this.net.tint = 0xff0000;
                }
            }


            this.cannonStartPos.x = this.game.input.activePointer.x;
            this.cannonStartPos.y = this.game.input.activePointer.y;

            this.net._ocelot = this.player.frame;
            this.net.x = this.cannonStartPos.x;
            this.net.y = this.cannonStartPos.y;
            this.net.visible = false;
            this.net.body.enable = false;

            //if (this.cannonStartPos.x <= Utils.GlobalSettings.width / 2) {
            //    this.player.scale.x = -1;
            //    this.emitter.x = this.player.x + 26;
            //}
            //else {
            //    this.player.scale.x = 1;
            //    this.emitter.x = this.player.x - 26;
            //}


            this.game.input.onDown.removeAll();
            this.game.input.onDown.addOnce(this.cannonStart, this);
        }
    },

    getLength: function(x0, y0, x1, y1) {
        // returns the length of a line segment
        var x = x1 - x0;
        var y = y1 - y0;
        return Math.sqrt(x * x + y * y);
    },

    cannonUpdate: function () {
        if (!this.gameOver) {
            this.bmd.cls();

            var color = this.colors[this.colorIndex].rgba;
            this.colorIndex = this.game.math.wrapValue(this.colorIndex, 1, 359);

            this.bmd.ctx.beginPath();
            this.bmd.ctx.strokeStyle = color;
            this.bmd.ctx.moveTo(this.cannonStartPos.x, this.cannonStartPos.y);
            this.bmd.ctx.lineTo(this.game.input.activePointer.x, this.game.input.activePointer.y);
            this.bmd.ctx.lineWidth = 4;

            this.bmd.ctx.stroke();

            this.bmd.ctx.closePath();

            if (this.cannonStartPos.x < this.game.input.activePointer.x) {
                this.player.scale.x = -1;
                this.emitter.x = this.player.x + 26;
            }
            else {
                this.player.scale.x = 1;
                this.emitter.x = this.player.x - 26;
            }


            this.length = this.getLength(this.cannonStartPos.x, this.cannonStartPos.y, this.game.input.activePointer.x, this.game.input.activePointer.y);
            this.radius = this.length / 5;
            this.angle = Phaser.Math.angleBetween(this.cannonStartPos.x, this.cannonStartPos.y, this.game.input.activePointer.x, this.game.input.activePointer.y);

            this.bmd.ctx.beginPath();
            this.bmd.ctx.arc(this.cannonStartPos.x, this.cannonStartPos.y, this.radius, this.angle - (Math.PI / 3), this.angle + (Math.PI / 3), false);
            this.bmd.ctx.fillStyle = 'transparent';
            this.bmd.ctx.fill();
            this.bmd.ctx.lineWidth = 4;
            if (this.net._ocelot === 0) {
                this.bmd.ctx.strokeStyle = '#ffffff';
            }
            else
                if (this.net._ocelot === 1) {
                    this.bmd.ctx.strokeStyle = '#ff0000';
                }
            this.bmd.ctx.stroke();

            this.bmd.ctx.beginPath();
            this.bmd.ctx.arc(this.cannonStartPos.x, this.cannonStartPos.y, 5, 0, 2 * Math.PI, false);
            this.bmd.ctx.fillStyle = color;
            this.bmd.ctx.fill();
            this.bmd.ctx.lineWidth = 2;
            this.bmd.ctx.strokeStyle = color;
            this.bmd.ctx.stroke();

            this.bmd.ctx.beginPath();
            this.bmd.ctx.arc(this.game.input.activePointer.x, this.game.input.activePointer.y, 10, 0, 2 * Math.PI, false);
            this.bmd.ctx.fillStyle = color;
            this.bmd.ctx.fill();
            this.bmd.ctx.lineWidth = 2;
            this.bmd.ctx.strokeStyle = color;
            this.bmd.ctx.stroke();

            this.net.x = this.cannonStartPos.x;
            this.net.y = this.cannonStartPos.y;
            this.net.scale.set(this.radius / 23, this.radius / 23);
            this.net.rotation = this.angle - (Math.PI / 2);

            //this.bmd.circle(this.cannonStartPos.x, this.cannonStartPos.y, 50, 'transparent');
        }
    },

    cannonEnd: function () {
        if (!this.gameOver) {
            if (!Utils.GlobalSettings.muted) {
                this.blipSnd.play();
            }

            this.net.x = this.cannonStartPos.x;
            this.net.y = this.cannonStartPos.y;

            this.net.visible = true;

            this.net.reset(this.cannonStartPos.x, this.cannonStartPos.y);
            this.net.revive();
            this.net.body.enable = true;
            this.net.scale.x -= 0.1;
            this.net.scale.y -= 0.1;
            //this.net.body.setSize(this.radius, this.radius, 0, 0);
            //this.net.body.updateBounds()

            var speed = this.length * 3;
            if (speed > 600) {
                speed = 600;
            }
            this.game.physics.arcade.velocityFromRotation(this.net.rotation - (Math.PI / 2), speed, this.net.body.velocity);

            this.bmd.cls();

            this.cannonStartPos.x = -1;
            this.cannonStartPos.y = -1;

            if (this.screenShake) {
                this.screenShake.shake(5);
            }

            this.game.input.onUp.removeAll();
            this.game.input.onUp.addOnce(this.cannonEnd, this);
        }
    },
    
    submitScore: function () {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "http://www.gamepyong.com/firewords/php/firewords.php", true);
        var parameters = "action=score&nickname=" + Utils.GlobalSettings.lastNickname + "&score=" + this.actualScore;

        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var msg = xmlHttp.responseText;
                console.log('score submit');
            }
        }.bind(this);

        xmlHttp.ontimeout = function () {
        }.bind(this);

        xmlHttp.send(parameters);
    },
        
    exitClick: function () {
        if (!Utils.GlobalSettings.muted) {
            this.clickSnd.play();
        }
        
        this.exitButton.events.onInputDown.removeAll();
        this.soundButton.events.onInputDown.removeAll();
        this.exitButton.visible = false;
        this.soundButton.visible = false;

        this.game.state.start('mainmenu');

        return false;
    },

    soundClick: function () {
        Utils.GlobalSettings.muted = !Utils.GlobalSettings.muted;
        if (!Utils.GlobalSettings.muted) {
            this.clickSnd.play();
            this.soundButton.setFrames(7, 6, 7);
            //Utils.BackgroundMusic.bgm1.restart('', 0, 0.5, true);
        }
        else {
            this.soundButton.setFrames(9, 8, 9);
            //Utils.BackgroundMusic.bgm1.pause();
        }

        this.soundButton.events.onInputDown.removeAll();
        this.soundButton.events.onInputDown.addOnce(this.soundClick.bind(this));
    },

    updateClouds: function (cloud) {
        if (cloud) {
            if (cloud.y >= 0 && (!cloud.inWorld || cloud.y > Utils.GlobalSettings.height)) {
                cloud.x = this.game.rnd.integerInRange(-100, Utils.GlobalSettings.width - 100);
                cloud.y = this.game.rnd.integerInRange(-cloud.height - 100, -cloud.height-200);
                cloud.frame = this.game.rnd.integerInRange(0, 8);
                cloud.alpha = this.game.rnd.realInRange(0.1, 0.3);
                cloud._xspeed = this.game.rnd.realInRange(-0.3, 0.3);
                cloud._yspeed = this.game.rnd.realInRange(3.2, 3.4);
                cloud.scale.set(this.game.rnd.realInRange(0.5, 2));
            }
            else {
                cloud.x += cloud._xspeed;

                if (cloud._curYSpeed < cloud._yspeed) {
                    cloud._curYSpeed += 0.01;
                }
                else {
                    cloud._curYSpeed = cloud._yspeed;
                }
                cloud.y += cloud._curYSpeed;
            }
        }
    },

    netHitAnimal: function (net, animal) {
        if (!this.gameOver) {
            if (animal.y + animal.height / 2 > 0) {
                if (net._ocelot === 0) {
                    if (animal.frame < 10) {
                        if (net.scale.x > 0) {
                            net.scale.x -= 0.8;
                            net.scale.y -= 0.8;
                            if (net.scale.x < 0.8) {
                                net.scale.x = 0;
                                net.scale.y = 0;
                                net.kill();
                                net.body.velocity.x = 0;
                                net.body.velocity.y = 0;
                                net.body.drag.x = 0;
                                net.body.x = -100;
                                net.body.y = -100;
                                net.body.enable = false;
                            }
                        }

                        this.doAnimalEffect(animal);
                        animal.kill();
                        animal.body.velocity.x = 0;
                        animal.body.velocity.y = 0;
                        animal.body.drag.x = 0;
                        animal.body.x = -100;
                        animal.body.y = -100;
                        animal.body.enable = false;
                        if (!this.firstTime) {
                            this.animalTimer = this.game.time.events.add(1000, this.launchAnimal.bind(this));
                        }
                    }
                    else {
                        net.scale.x = 0;
                        net.scale.y = 0;
                        net.kill();
                        net.body.velocity.x = 0;
                        net.body.velocity.y = 0;
                        net.body.drag.x = 0;
                        net.body.x = -100;
                        net.body.y = -100;
                        net.body.enable = false;

                        this.doAnimalEffect(animal);
                        animal.kill();
                        animal.body.velocity.x = 0;
                        animal.body.velocity.y = 0;
                        animal.body.drag.x = 0;
                        animal.body.x = -100;
                        animal.body.y = -100;
                        animal.body.enable = false;
                        this.animalTimer = this.game.time.events.add(1000, this.launchAnimal.bind(this));
                    }
                }
                else
                    if (net._ocelot === 1) {
                        if (animal.frame === 10) {
                            if (net.scale.x > 0) {
                                net.scale.x -= 0.8;
                                net.scale.y -= 0.8;
                                if (net.scale.x < 0.8) {
                                    net.scale.x = 0;
                                    net.scale.y = 0;
                                    net.kill();
                                    net.body.velocity.x = 0;
                                    net.body.velocity.y = 0;
                                    net.body.drag.x = 0;
                                    net.body.x = -100;
                                    net.body.y = -100;
                                    net.body.enable = false;
                                }
                            }

                            this.actualScore += 500;
                            this.scoreBuffer = this.actualScore;

                            this.doBombEffect(animal, false);
                            animal.kill();
                            animal.body.velocity.x = 0;
                            animal.body.velocity.y = 0;
                            animal.body.drag.x = 0;
                            animal.body.x = -100;
                            animal.body.y = -100;
                            animal.body.enable = false;
                            this.animalTimer = this.game.time.events.add(1000, this.launchAnimal.bind(this));
                        }
                        else {
                            net.scale.x = 0;
                            net.scale.y = 0;
                            net.kill();
                            net.body.velocity.x = 0;
                            net.body.velocity.y = 0;
                            net.body.drag.x = 0;
                            net.body.x = -100;
                            net.body.y = -100;
                            net.body.enable = false;
                        }
                    }
            }
        }
    },

    increaseScore: function () {
        this.score += 10;
        if (this.score > this.actualScore) {
            this.score = this.actualScore;
        }
        this.scoreText.setText('' + this.score);
    },
        
    update: function () {
        //if (Utils.GlobalSettings.muted && !this.stopMusicOnLoad && this.game.cache.isSoundDecoded('bgm1')) {
        //    this.stopMusicOnLoad = true;
        //    Utils.BackgroundMusic.bgm1.pause();
        //}    

        this.cloudPool.forEachAlive(this.updateClouds, this);

        if (this.cannonStartPos.x !== -1 && this.cannonStartPos.y !== -1) {
            this.cannonUpdate();
        }

        this.animalPool.forEachAlive(this.updateAnimal, this);
        this.updateNet();

        this.game.physics.arcade.overlap(this.net, this.animalPool, this.netHitAnimal, null, this);

        if (this.scoreBuffer > 0) {
            this.increaseScore();
            this.scoreBuffer -= 10;
            if (this.scoreBuffer < 0) {
                this.scoreBuffer = 0;
            }
        }

        //this.flare.x = this.player.x - 29;
        //this.flare.y = this.player.y + 110;
    },

    //render: function () {
    //    this.game.debug.body(this.net);
    //    //for (var i = 0; i < 10; i++) {
    //    //    this.game.debug.body(this.letterPool.getAt(i));
    //    //}

    //    //for (var i = 0; i < 10; i++) {
    //    //    this.game.debug.body(this.pickupPool.getAt(i));
    //    //}
    //},

    shutdown: function () {
        Utils.GlobalSettings.save();

        if (navigator.isCocoonJS) {
            document.removeEventListener("backbutton", this.exitHandler, false);

            if (Utils.adManager.banner) {
                Utils.adManager.banner.hide();
            }
        }

        if (this.clickSnd) {
            this.clickSnd.stop();
            this.clickSnd.destroy();
            this.clickSnd = null;
        }
        
        if (this.soundButton) {
            this.soundButton.destroy();
            this.soundButton = null;
        }

        if (this.exitButton) {
            this.exitButton.destroy();
            this.exitButton = null;
        }

        if (this.screenShake) {
            this.screenShake.destroy();
            this.screenShake = null;
        }

        this.colors = null;

        if (this.bg) {
            this.bg.destroy();
            this.bg = null;
        }

        if (this.scoreText) {
            this.scoreText.destroy();
            this.scoreText = null;
        }

        if (this.cloudPool) {
            this.cloudPool.destroy();
            this.cloudPool = null;
        }

        if (this.player) {
            this.player.destroy();
            this.player = null;
        }

        if (this.animalPool) {
            this.animalPool.destroy();
            this.animalPool = null;
        }

        if (this.animalEffectPool) {
            this.animalEffectPool.destroy();
            this.animalEffectPool = null;
        }

        if (this.bombEffectPool) {
            this.bombEffectPool.destroy();
            this.bombEffectPool = null;
        }

        if (this.emitter) {
            this.emitter.destroy();
            this.emitter = null;
        }

        if (this.bmd) {
            this.bmd = null;
        }

        if (this.net) {
            this.net.destroy();
            this.net = null;
        }
        
        this.cannonStartPos = null;

        if (this.gameoverImg) {
            this.gameoverImg.destroy();
            this.gameoverImg = null;
        }

        if (this.restartButton) {
            this.restartButton.destroy();
            this.restartButton = null;
        }

        Utils.GlobalSettings.fromScreen = 'gamescreen';
                
        console.log('destroy gamescreen');
    }
};