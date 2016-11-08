Screen.Preloader = function (game) {
    this.game = game;
};

Screen.Preloader.prototype = {

    loaded: false,
    ready: false,

    preload: function () {
        this.loaderEmpty = this.game.add.sprite(0, 0, 'loaderEmpty');
        this.loaderEmpty.x = Utils.GlobalSettings.width / 2 - this.loaderEmpty.width / 2;
        this.loaderEmpty.y = Utils.GlobalSettings.height -150;
        this.loaderFull = this.game.add.sprite(0, 0, 'loaderFull');
        this.loaderFull.x = Utils.GlobalSettings.width / 2 - this.loaderFull.width / 2;
        this.loaderFull.y = Utils.GlobalSettings.height - 150;

        this.game.load.image('backing', 'assets/backing.png');
        this.game.load.image('bg', 'assets/bg.jpg');
        this.game.load.image('panel', 'assets/panel.png');
        this.game.load.image('net', 'assets/net.png');
        this.game.load.image('title', 'assets/title.png');
        this.game.load.image('gameover', 'assets/gameover.png');
                                        
        this.game.load.spritesheet('systembuttons', 'assets/systembuttons.png', 80, 84);
        this.game.load.spritesheet('letters', 'assets/letters.png', 64, 64);
        this.game.load.spritesheet('restart', 'assets/restart.png', 80, 80);
        this.game.load.spritesheet('play', 'assets/play.png', 80, 80);
        this.game.load.spritesheet('circle', 'assets/circle.png', 80, 80);
        this.game.load.spritesheet('circle2', 'assets/circle2.png', 60, 60);
        this.game.load.spritesheet('levelbuttonprops', 'assets/levelbuttonprops.png', 32, 25);
        this.game.load.spritesheet('clouds', 'assets/clouds.png', 218, 100);
        this.game.load.spritesheet('ocelot', 'assets/ocelot.png', 90, 141);
        this.game.load.spritesheet('flare', 'assets/flare.png', 34, 142);
        this.game.load.spritesheet('fire', 'assets/fire.png', 10, 10);
        this.game.load.spritesheet('animals', 'assets/animals.png', 50, 50);
        this.game.load.spritesheet('exp', 'assets/exp.png', 64, 64);

        this.game.load.atlas('atlas', 'assets/spritesheet.png', 'assets/sprites.json');
        
        this.game.load.audio('gp', ['assets/audio/gp.ogg']);
        this.game.load.audio('click', ['assets/audio/click.ogg']);
        this.game.load.audio('drip', ['assets/audio/drip.ogg']);
        this.game.load.audio('correct', ['assets/audio/correct.ogg']);
        this.game.load.audio('wrong', ['assets/audio/wrong.ogg']);
        this.game.load.audio('blip', ['assets/audio/blip3.ogg']);
        this.game.load.audio('teleport', ['assets/audio/teleport.ogg']);
        this.game.load.audio('explosion', ['assets/audio/explosion.ogg']);

        this.game.load.bitmapFont('mecha', 'assets/fonts/mecha_0.png', 'assets/fonts/mecha' + (navigator.isCocoonJS ? '.json' : '.xml'));
        this.game.load.bitmapFont('fader', 'assets/fonts/fader_0.png', 'assets/fonts/fader' + (navigator.isCocoonJS ? '.json' : '.xml'));

        this.game.load.text('text', 'assets/text.json');

        this.game.load.onFileComplete.add(this.fileLoaded, this);
        
        this.game.load.setPreloadSprite(this.loaderFull);

        this.game.add.sprite(0, 0, '');
    },

    fileLoaded: function (progress, cacheID, success, filesLoaded, totalFiles) {
        if (filesLoaded === totalFiles && !this.loaded) {
            this.loaded = true;
        }
    },

    update: function () {
        if (!this.ready && this.loaded /*&& this.cache.isSoundDecoded('bgm1')*/) {
            this.ready = true;

            Utils.GlobalSettings.text = JSON.parse(this.game.cache.getText('text'));            
            Utils.BackgroundMusic.load(this.game);

            this.game.state.start('splashscreen');
        }
    },

    shutdown: function () {
        if (this.loaderEmpty) {
            this.loaderEmpty.destroy();
            this.loaderEmpty = null;
        }

        if (this.loaderFull) {
            this.loaderFull.destroy();
            this.loaderFull = null;
        }
    }
};