Screen.SplashScreen = function (game) {
    this.game = game;
};

Screen.SplashScreen.prototype = {

    create: function () {
        this.gp = this.game.add.audio('gp');
        this.gp.play();
        
        this.logo = this.game.add.sprite(0, 0, 'atlas', 'logo');
        this.logo.x = Utils.GlobalSettings.width / 2 - this.logo.width / 2;
        this.logo.y = Utils.GlobalSettings.height / 2 - this.logo.height / 2;
        this.logo.scale.x = 20;
        this.logo.scale.y = 20;

        this.tween = this.game.add.tween(this.logo.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Sinusoidal.Out, true);
        this.tween2 = this.game.add.tween(this.logo).to({ alpha: 0 }, 500);
        this.tween.chain(this.tween2);
        this.tween2.onComplete.add(this.done.bind(this));

        this.game.add.sprite(0, 0, '');
    },

    done: function () {
        if (!Utils.GlobalSettings.muted) {
            //Utils.BackgroundMusic.bgm1.play('', 0, 0.5, true);
        }
        this.game.state.start('mainmenu');
    },

    update: function () {
    },

    shutdown: function () {
        if (this.gp) {
            this.gp.stop();
            this.gp.destroy();
            this.gp = null;
        }

        if (this.logo) {
            this.logo.destroy();
            this.logo = null;
        }

        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }

        if (this.tween2) {
            this.tween2.onComplete.removeAll();
            this.tween2.stop();
            this.tween2 = null;
        }
    }
};