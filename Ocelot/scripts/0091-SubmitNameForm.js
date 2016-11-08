var UI = {};

UI.SubmitNameForm = function (game, state) {
    this.game = game;
    this.state = state;
    this.letterArray = [];
    this.backing = null;
    this.nicknameText = null;
    this.headingText = null;
};

UI.SubmitNameForm.prototype = {
    init: function () {

        this.backing = this.game.add.sprite(0, 0, 'backing');
        this.backing.alpha = 0;
        this.backing.width = Utils.GlobalSettings.width;
        this.backing.height = Utils.GlobalSettings.height;
        var tweenBacking = this.game.add.tween(this.backing).to({ alpha: 0.8 }, 1000, Phaser.Easing.Sinusoidal.Out, true);

        this.headingText = this.game.add.bitmapText(10, 300, 'mecha', 'Please enter your nickname:', 50);
        this.headingText.updateTransform();
        this.headingText.position.x = Utils.GlobalSettings.width / 2 - this.headingText.textWidth / 2;
        
        this.nicknameText = this.game.add.bitmapText(40, 400, 'mecha', Utils.GlobalSettings.lastNickname, 70);
        this.nicknameText.updateTransform();
        this.nicknameText.position.x = Utils.GlobalSettings.width / 2 - this.nicknameText.textWidth / 2;

        this.goButton = this.game.add.button(Utils.GlobalSettings.width - 140, 400, 'letters', null, this, 27, 27, 27);
        this.goButton.visible = false;
        if (Utils.GlobalSettings.lastNickname.trim().length > 0)
            this.goButton.visible = true;
        this.goButton.events.onInputDown.addOnce(this.goClick.bind(this));
                
        var offs = 0;
        var offsi = 9;
        var xp = 10;
        var yp = 550;
        for (var i = 0; i < offsi; i++) {
            var letterButton = this.game.add.button(xp + (i * 70), yp, 'letters', this.letterPressed.bind(this, i), this, i, i, i);
            this.letterArray.push(letterButton);

            letterButton = this.game.add.button(xp + (i * 70), yp+75, 'letters', this.letterPressed.bind(this, i + offsi), this, i + offsi, i + offsi, i + offsi);
            this.letterArray.push(letterButton);

            if (i + (offsi * 2) < 27) {
                letterButton = this.game.add.button(xp + (i * 70), yp+(75*2), 'letters', this.letterPressed.bind(this, i + (offsi * 2)), this, i + (offsi * 2), i + (offsi * 2), i + (offsi * 2));
                this.letterArray.push(letterButton);
            }
        }
    },
    
    letterPressed: function (letterNum) {
        if (!Utils.GlobalSettings.muted) {
            this.state.dripSnd.play();
        }

        var letter = '';
        switch (letterNum) {
            case 0: letter = 'a'; break;
            case 1: letter = 'b'; break;
            case 2: letter = 'c'; break;
            case 3: letter = 'd'; break;
            case 4: letter = 'e'; break;
            case 5: letter = 'f'; break;
            case 6: letter = 'g'; break;
            case 7: letter = 'h'; break;
            case 8: letter = 'i'; break;
            case 9: letter = 'j'; break;
            case 10: letter = 'k'; break;
            case 11: letter = 'l'; break;
            case 12: letter = 'm'; break;
            case 13: letter = 'n'; break;
            case 14: letter = 'o'; break;
            case 15: letter = 'p'; break;
            case 16: letter = 'q'; break;
            case 17: letter = 'r'; break;
            case 18: letter = 's'; break;
            case 19: letter = 't'; break;
            case 20: letter = 'u'; break;
            case 21: letter = 'v'; break;
            case 22: letter = 'w'; break;
            case 23: letter = 'x'; break;
            case 24: letter = 'y'; break;
            case 25: letter = 'z'; break;
        }

        if (letterNum === 26) {
            if (Utils.GlobalSettings.lastNickname.length > 0) {
                Utils.GlobalSettings.lastNickname = Utils.GlobalSettings.lastNickname.substring(0, Utils.GlobalSettings.lastNickname.length - 1);
                this.nicknameText.setText(Utils.GlobalSettings.lastNickname);
                this.nicknameText.updateTransform();
                this.nicknameText.position.x = Utils.GlobalSettings.width / 2 - this.nicknameText.textWidth / 2;
            }
        }
        else {
            if (Utils.GlobalSettings.lastNickname.length < 5) {
                Utils.GlobalSettings.lastNickname += letter;
                this.nicknameText.setText(Utils.GlobalSettings.lastNickname);
                this.nicknameText.updateTransform();
                this.nicknameText.position.x = Utils.GlobalSettings.width / 2 - this.nicknameText.textWidth / 2;
            }
        }

        if (this.nicknameText.text.trim().length > 0)
            this.goButton.visible = true;
        else
            this.goButton.visible = false;
    },

    goClick: function () {
        if (!Utils.GlobalSettings.muted) {
            this.state.clickSnd.play();
        }
        this.goButton.events.onInputDown.removeAll();
        this.game.state.start('gamescreen');
    },

    destroy: function () {
       
        if (this.letterArray) {
            for (var i = 0; i < this.letterArray.length; i++) {
                if (this.letterArray[i]) {
                    this.letterArray[i].destroy();
                    this.letterArray[i] = null;
                }
            }
            this.letterArray = null;
        }

        if (this.backing) {
            this.backing.destroy();
            this.backing = null;
        }

        if (this.nicknameText) {
            this.nicknameText.destroy();
            this.nicknameText = null;
        }

        if (this.headingText) {
            this.headingText.destroy();
            this.headingText = null;
        }

        if (this.goButton) {
            this.goButton.destroy();
            this.goButton = null;
        }

        console.log('destroy submitscoreform');
    }
};