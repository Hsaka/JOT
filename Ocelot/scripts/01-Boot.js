var Screen = {};

Screen.Boot = function (game) {
    this.game = game;
};

Screen.Boot.prototype = {
    
    setupScaling: function () {

        if (navigator.isCocoonJS) {
            
            this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            this.game.scale.pageAlignHorizontally = true;
            this.game.scale.pageAlignVertically = true;
        }
        else {
            this.game.stage.disableVisibilityChange = false;
            
            if (this.game.device.desktop) {
                this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.game.scale.pageAlignHorizontally = true;
                this.game.scale.pageAlignVertically = true;
            }
            else {
                this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.game.scale.pageAlignHorizontally = true;
                this.game.scale.pageAlignVertically = true;
                this.game.scale.forceOrientation(false, true, 'orientation');
            }

            this.game.world.setBounds(0, 0, Utils.GlobalSettings.width, Utils.GlobalSettings.height);
        }
    },
    
    preload: function () {
        this.game.load.image('loaderFull', 'assets/loadingFull.png');
        this.game.load.image('loaderEmpty', 'assets/loadingEmpty.png');
        this.game.load.image('orientation', 'assets/orientation.jpg');
    },

    create: function () {

        this.setupScaling();

        if (this.game.device.desktop) {
            Utils.GlobalSettings.isMobile = false;
        }
        else {
            Utils.GlobalSettings.isMobile = true;
        }

        if (navigator.isCocoonJS) {
            if (Utils.adManager) {
                Utils.adManager.loadAds();
            }
        }

        //not sure about this...
        this.game.forceSingleUpdate = true;

        this.game.state.start('preloader');
    }

};