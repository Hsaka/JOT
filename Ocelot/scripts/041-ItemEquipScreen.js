Screen.KiteEquipScreen = function (game) {
    this.game = game;
};

Screen.KiteEquipScreen.prototype = {

    create: function () {
        this.setup();
    },

    setup: function () {

        Utils.GlobalSettings.load();

        this.clickSnd = this.game.add.audio('click');
        this.flip1Snd = this.game.add.audio('flip1');
        this.flip2Snd = this.game.add.audio('flip2');

        this.bg = this.game.add.image(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2, 'bg');
        this.bg.anchor.set(0.5);
        this.bg.alpha = 0;
        
        this.levelselectbg = this.game.add.image(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2 + 20, 'panel');
        this.levelselectbg.anchor.set(0.5);
        this.levelselectbg.scale.set(0);
        
        this.prevButton = this.game.add.button(-100, Utils.GlobalSettings.height - 130, 'systembuttons', null, this, 12, 12, 12);
        this.nextButton = this.game.add.button(Utils.GlobalSettings.width + 20, Utils.GlobalSettings.height - 130, 'systembuttons', null, this, 14, 14, 14);
        this.prevButton.events.onInputDown.addOnce(this.prevClick.bind(this));
        this.nextButton.events.onInputDown.addOnce(this.nextClick.bind(this));

        this.okButton = this.game.add.button(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height - 130, 'systembuttons', null, this, 17, 16, 17);
        this.okButton.anchor.set(0.5);
        this.okButton.scale.set(0);
        this.okButton.events.onInputDown.addOnce(this.okClick.bind(this));

        this.equippedButton = this.game.add.button(60, 60, 'letters', null, this, 0, 0, 0);
        this.equippedButton.anchor.set(0.5);

        this.equippedTxt = this.game.add.bitmapText(30, 90, 'mecha', 'Selected', 20);
        this.equippedItemTxt = this.game.add.bitmapText(this.equippedButton.x, 10, 'mecha', '', 20);

        //this.coinIcon = this.game.add.sprite(20, 130, 'coin');
        //this.coinIcon.animations.add('spin', [0, 1, 2, 3, 4, 5, 6, 7], 15, true);
        //this.coinIcon.play('spin');
        //this.coinIcon.alpha = 0;
        this.coinsText = this.game.add.bitmapText(20, 130, 'mecha', '' + Utils.GlobalSettings.coins, 72);
        this.coinsText.alpha = 0;

        this.itemButtons = [];
        this.itemButtonCostTxts = [];
        this.itemButtonProp = [];
        var costTxt;
        var prop;
        var yp = 300;
        var xp = 0;
        var itembuttontween;
        var costtxttween;
        var proptween;
        var itemIndex = 0;

        this.page = 0;
        this.maxItems = Utils.GlobalSettings.itemsAvailable.length;
        
        for (var i = 0; i < 12; i++) {
            
            spr = this.game.add.button(110 + (xp * 140), yp, 'letters', null, this, 0, 0, 0);
            spr.anchor.set(0.5);
            spr.scale.set(0);
            spr.events.onInputDown.addOnce(this.kiteButtonClick.bind(this, i));
            
            costTxt = this.game.add.bitmapText(110 + (xp * 140), yp + 50, 'mecha', '', 25);            
            costTxt.tint = 0x555555;
            costTxt.alpha = 0;
            costTxt.visible = true;

            prop = this.game.add.image(120 + (xp * 140), yp - 70, 'levelbuttonprops', 0);
            prop.alpha = 0;
            prop.visible = true;

            if (i < Utils.GlobalSettings.itemsAvailable.length) {
                if (Utils.GlobalSettings.itemsAvailable[i] === -1) {
                    prop.frame = 1;
                }
                else {
                    prop.visible = false;
                    costTxt.visible = false;
                }
            }
            else {
                prop.frame = 1;
            }
            
            itemIndex = i + 1;
            if (itemIndex > this.maxItems) {
                spr.setFrames(0, 0, 0, 0);
                costTxt.setText('');
                spr.alpha = 0.2;
            }
            else {
                spr.setFrames(itemIndex-1, itemIndex-1, itemIndex-1, itemIndex-1);
                costTxt.setText('100 Coins');
                spr.alpha = 1;
            }
            costTxt.updateTransform();
            costTxt.position.x = 110 + (xp * 140) - costTxt.textWidth / 2;

            xp++;

            if (i === 3 || i == 7) {
                yp += 200;
                xp = 0;
            }

            this.itemButtons.push(spr);
            this.itemButtonCostTxts.push(costTxt);
            this.itemButtonProp.push(prop);

            itembuttontween = this.game.add.tween(spr.scale).to({ x: 1.4, y: 1.4 }, 1000, Phaser.Easing.Elastic.Out, false, 1600 + (i * 25));
            itembuttontween.start();
            
            costtxttween = this.game.add.tween(costTxt).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, false, 1600 + (i * 50));
            costtxttween.start();

            proptween = this.game.add.tween(prop).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, false, 1600 + (i * 50));
            proptween.start();
        }

        var bgtween = this.game.add.tween(this.bg).to({ alpha: 0.3 }, 500, Phaser.Easing.Linear.Out);
        var levelselectbgTween = this.game.add.tween(this.levelselectbg.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Back.Out, false, 500);
        var prevTween = this.game.add.tween(this.prevButton).to({ x: 30 }, 1000, Phaser.Easing.Sinusoidal.Out, false, 1500);
        var nextTween = this.game.add.tween(this.nextButton).to({ x: Utils.GlobalSettings.width - 110 }, 1000, Phaser.Easing.Sinusoidal.Out, false, 1500);
        var okTween = this.game.add.tween(this.okButton.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, false, 1500);
        //var coinIconTween = this.game.add.tween(this.coinIcon).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, false, 2000);
        var coinTextTween = this.game.add.tween(this.coinsText).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, false, 2000);

        bgtween.start();
        levelselectbgTween.start();
        prevTween.start();
        nextTween.start();
        okTween.start();
        //coinIconTween.start();
        coinTextTween.start();

        if (Utils.GlobalSettings.itemSelected === -1) {
            this.equippedButton.visible = false;
            this.equippedTxt.visible = false;
            this.equippedItemTxt.visible = false;
        }
        else {
            this.equippedButton.visible = true;
            this.equippedTxt.visible = true;
            this.equippedButton.setFrames(Utils.GlobalSettings.itemSelected, Utils.GlobalSettings.itemSelected, Utils.GlobalSettings.itemSelected, Utils.GlobalSettings.itemSelected);
            this.equippedButton.scale.set(0);
            this.equippedTxt.alpha = 0;

            this.equippedItemTxt.visible = true;
            this.equippedItemTxt.setText('Kite');
            this.equippedItemTxt.updateTransform();
            this.equippedItemTxt.position.x = this.equippedButton.x - this.equippedItemTxt.textWidth / 2;
            this.equippedItemTxt.alpha = 0;

            var equippedButtonTween = this.game.add.tween(this.equippedButton.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, false, 1500);
            equippedButtonTween.start();

            var equippedTxtTween = this.game.add.tween(this.equippedTxt).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out,false, 1500);
            equippedTxtTween.start();

            var kiteTxtTween = this.game.add.tween(this.equippedItemTxt).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, false, 1500);
            kiteTxtTween.start();
        }

        this.statusMsgTxt = this.game.add.bitmapText(0, 0, 'mecha', '', 25);
        this.statusMsgTxt.alpha = 0;
        this.statusMsgTxt.visible = false;

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

        this.stopMusicOnLoad = false;

        if (navigator.isCocoonJS) {
            this.exitHandler = this.exitClick.bind(this);
            document.addEventListener("backbutton", this.exitHandler, false);
        }

        //swipe gestures
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;

        this.game.input.onDown.removeAll();
        this.game.input.onUp.removeAll();
        this.game.input.onDown.add(this.beginSwipe.bind(this));

        this.game.add.sprite(0, 0, '');
    },
    
    beginSwipe: function () {
        this.startX = this.game.input.worldX;
        this.startY = this.game.input.worldY;
        this.game.input.onDown.removeAll();
        this.game.input.onUp.add(this.endSwipe.bind(this));
    },

    endSwipe: function () {
        // saving mouse/finger coordinates
        this.endX = this.game.input.worldX;
        this.endY = this.game.input.worldY;
        // determining x and y distance travelled by mouse/finger from the start
        // of the swipe until the end
        var distX = this.startX - this.endX;
        var distY = this.startY - this.endY;

        if (Math.abs(distX) > Math.abs(distY) * 2 && Math.abs(distX) > 10) {
            // moving left, calling move function with horizontal and vertical tiles to move as arguments
            if (distX > 0) {
                this.nextClick();
            }
                // moving right, calling move function with horizontal and vertical tiles to move as arguments
            else {
                this.prevClick();
            }
        }

        // stop listening for the player to release finger/mouse, let's start listening for the player to click/touch
        this.game.input.onDown.add(this.beginSwipe.bind(this));
        this.game.input.onUp.removeAll();
    },

    okClick: function () {
        if (!Utils.GlobalSettings.muted) {
            this.clickSnd.play();
        }

        this.okButton.events.onInputDown.removeAll();

        this.game.state.start(Utils.GlobalSettings.fromScreen);
    },

    prevClick: function () {
        if (!Utils.GlobalSettings.muted) {
            this.flip2Snd.play();
        }

        if (this.page > 0) {
            this.page--;
            this.updateItemButtons(0);
        }

        this.prevButton.events.onInputDown.removeAll();
        this.prevButton.events.onInputDown.addOnce(this.prevClick.bind(this));

    },

    nextClick: function () {
        if (!Utils.GlobalSettings.muted) {
            this.flip1Snd.play();
        }        

        if (this.page < Math.floor(this.maxItems / 12)) {
            this.page++;
            this.updateItemButtons(0);
        }

        this.nextButton.events.onInputDown.removeAll();
        this.nextButton.events.onInputDown.addOnce(this.nextClick.bind(this));

    },

    kiteButtonClick: function (i) {
        if (!Utils.GlobalSettings.muted) {
            this.clickSnd.play();
        }

        if (this.itemButtons && this.itemButtons[i]) {
            var tween;

            this.itemButtons[i].events.onInputDown.removeAll();
            this.itemButtons[i].events.onInputDown.addOnce(this.kiteButtonClick.bind(this, i));

            var startingNum = this.page * 12;
            var item = startingNum + i;

            if (item < Utils.GlobalSettings.itemsAvailable.length) {
                if (Utils.GlobalSettings.itemsAvailable[item] === -1) {

                    if (Utils.GlobalSettings.coins >= 100) {
                        Utils.GlobalSettings.coins -= 100;
                        this.coinsText.setText('' + Utils.GlobalSettings.coins);
                        Utils.GlobalSettings.itemsAvailable[item] = 0;
                        this.itemButtonCostTxts[i].setText('');
                        this.itemButtonProp[i].visible = false;
                        this.selectItem(i, item);
                    }
                    else {
                        this.statusMsgTxt.setText('Not enough coins!');
                        this.statusMsgTxt.tint = 0x111111;
                        this.statusMsgTxt.updateTransform();
                        this.statusMsgTxt.position.x = this.itemButtons[i].x - this.statusMsgTxt.textWidth / 2;
                        this.statusMsgTxt.position.y = this.itemButtons[i].y + 70;
                        this.statusMsgTxt.alpha = 1;
                        this.statusMsgTxt.visible = true;
                        tween = this.game.add.tween(this.statusMsgTxt).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.Out);
                        tween.start();
                    }
                }
                else {
                    this.selectItem(i, item);
                }
            }
            else {
                this.statusMsgTxt.setText('Not yet available!');
                this.statusMsgTxt.tint = 0x111111;
                this.statusMsgTxt.updateTransform();
                this.statusMsgTxt.position.x = this.itemButtons[i].x - this.statusMsgTxt.textWidth / 2;
                this.statusMsgTxt.position.y = this.itemButtons[i].y + 70;
                this.statusMsgTxt.alpha = 1;
                this.statusMsgTxt.visible = true;
                tween = this.game.add.tween(this.statusMsgTxt).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.Out);
                tween.start();
            }
            
        }
    },

    selectItem: function(i, item) {
        Utils.GlobalSettings.itemSelected = item;
        Utils.GlobalSettings.save();
        this.statusMsgTxt.setText('item equipped!');
        this.statusMsgTxt.tint = 0x111111;
        this.statusMsgTxt.updateTransform();
        this.statusMsgTxt.position.x = this.itemButtons[i].x - this.statusMsgTxt.textWidth / 2;
        this.statusMsgTxt.position.y = this.itemButtons[i].y + 70;
        this.statusMsgTxt.alpha = 1;
        this.statusMsgTxt.visible = true;
        tween = this.game.add.tween(this.statusMsgTxt).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.Out);
        tween.start();

        this.equippedButton.visible = true;
        this.equippedButton.scale.set(0);
        this.equippedButton.setFrames(item, item, item, item);
        this.equippedButton.tint = this.itemButtons[i].tint;
        var tween2 = this.game.add.tween(this.equippedButton.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out);
        tween2.start();

        this.equippedTxt.visible = true;
        this.equippedItemTxt.visible = true;
    },

    updateItemButtons: function (delay) {
        
        if (this.itemButtons && this.itemButtonCostTxts && this.itemButtonProp) {
            var spr;
            var costTxt;
            var yp = 300;
            var xp = 0;
            var itembuttontween;
            var costtxttween;
            var proptween;
            var prop;
            var itemIndex = 0;
            
            var startingNum = this.page * 12;
            for (var i = 0; i < this.itemButtons.length; i++) {
                spr = this.itemButtons[i];
                costTxt = this.itemButtonCostTxts[i];
                prop = this.itemButtonProp[i];

                if (spr && costTxt && prop) {
                    spr.scale.set(0);
                    spr.setFrames(0, 0, 0, 0);
                    
                    costTxt.tint = 0x555555;
                    costTxt.alpha = 0;
                    costTxt.visible = true;

                    prop.alpha = 0;
                    prop.visible = true;

                    if ((startingNum + i) < Utils.GlobalSettings.itemsAvailable.length) {
                        if (Utils.GlobalSettings.itemsAvailable[(startingNum + i)] === -1) {
                            prop.frame = 1;
                        }
                        else {
                            prop.visible = false;
                            costTxt.visible = false;
                        }
                    }
                    else {
                        prop.frame = 1;
                    }

                    itemIndex = startingNum + i + 1;
                    if (itemIndex > this.maxItems) {
                        spr.setFrames(0, 0, 0, 0);
                        costTxt.setText('');
                        spr.alpha = 0.2;
                    }
                    else {
                        spr.setFrames(itemIndex-1, itemIndex-1, itemIndex-1, itemIndex-1);
                        costTxt.setText('100 Coins');
                        spr.alpha = 1;
                    }
                    costTxt.updateTransform();
                    costTxt.position.x = 110 + (xp * 140) - costTxt.textWidth / 2;

                    xp++;

                    if (i === 3 || i == 7) {
                        yp += 200;
                        xp = 0;
                    }

                    itembuttontween = this.game.add.tween(spr.scale).to({ x: 1.4, y: 1.4 }, 1000, Phaser.Easing.Elastic.Out, false, delay + (i * 25));
                    itembuttontween.start();
                    
                    costtxttween = this.game.add.tween(costTxt).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, false, delay + (i * 50));
                    costtxttween.start();

                    proptween = this.game.add.tween(prop).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, false, delay + (i * 50));
                    proptween.start();
                }
            }
        }
    },

    exitClick: function () {
        if (!Utils.GlobalSettings.muted) {
            this.clickSnd.play();
        }

        this.exitButton.events.onInputDown.removeAll();
        this.exitButton.visible = false;

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

    update: function () {

        //if (Utils.GlobalSettings.muted && !this.stopMusicOnLoad && this.game.cache.isSoundDecoded('bgm1')) {
        //    this.stopMusicOnLoad = true;
        //    Utils.BackgroundMusic.bgm1.pause();
        //}
    },

    shutdown: function () {

        if (navigator.isCocoonJS) {
            document.removeEventListener("backbutton", this.exitHandler, false);
        }

        Utils.GlobalSettings.save();
        
        if (this.clickSnd) {
            this.clickSnd.stop();
            this.clickSnd.destroy();
            this.clickSnd = null;
        }

        if (this.flip1Snd) {
            this.flip1Snd.stop();
            this.flip1Snd.destroy();
            this.flip1Snd = null;
        }

        if (this.flip2Snd) {
            this.flip2Snd.stop();
            this.flip2Snd.destroy();
            this.flip2Snd = null;
        }

        if (this.soundButton) {
            this.soundButton.destroy();
            this.soundButton = null;
        }

        if (this.bg) {
            this.bg.destroy();
            this.bg = null;
        }
        
        if (this.levelselectbg) {
            this.levelselectbg.destroy();
            this.levelselectbg = null;
        }

        if (this.prevButton) {
            this.prevButton.destroy();
            this.prevButton = null;
        }

        if (this.nextButton) {
            this.nextButton.destroy();
            this.nextButton = null;
        }
        
        var i = 0;
        if (this.itemButtons) {
            for (i = 0; i < this.itemButtons.length; i++) {
                if (this.itemButtons[i]) {
                    this.itemButtons[i].destroy();
                    this.itemButtons[i] = null;
                }
            }
            this.itemButtons = null;
        }
        
        if (this.itemButtonCostTxts) {
            for (i = 0; i < this.itemButtonCostTxts.length; i++) {
                if (this.itemButtonCostTxts[i]) {
                    this.itemButtonCostTxts[i].destroy();
                    this.itemButtonCostTxts[i] = null;
                }
            }
            this.itemButtonCostTxts = null;
        }

        if (this.itemButtonProp) {
            for (i = 0; i < this.itemButtonProp.length; i++) {
                if (this.itemButtonProp[i]) {
                    this.itemButtonProp[i].destroy();
                    this.itemButtonProp[i] = null;
                }
            }
            this.itemButtonProp = null;
        }

        if (this.exitButton) {
            this.exitButton.destroy();
            this.exitButton = null;
        }

        if (this.statusMsgTxt) {
            this.statusMsgTxt.destroy();
            this.statusMsgTxt = null;
        }

        if (this.okButton) {
            this.okButton.destroy();
            this.okButton = null;
        }

        if (this.equippedButton) {
            this.equippedButton.destroy();
            this.equippedButton = null;
        }

        if (this.equippedTxt) {
            this.equippedTxt.destroy();
            this.equippedTxt = null;
        }

        if (this.equippedItemTxt) {
            this.equippedItemTxt.destroy();
            this.equippedItemTxt = null;
        }
        
        //if (this.coinIcon) {
        //    this.coinIcon.destroy();
        //    this.coinIcon = null;
        //}

        if (this.coinsText) {
            this.coinsText.destroy();
            this.coinsText = null;
        }

        Utils.GlobalSettings.fromScreen = 'kiteselect';
        
        console.log('destroy kiteequip');
    }
};