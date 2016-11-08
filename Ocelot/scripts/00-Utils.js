var Utils = {};

Utils.GlobalSettings = {
    namespace: 'jot',
    width: 640,
    height: 960,
    aspectX: 1,
    aspectY: 1,
    muted: false,
    lastNickname: '',
    firstTime: true,
    isMobile: false,
    continuing: false,
    adReady: false,
    text: null,
    timesAdNotShown: 0,
    adJustShown: false,
    mode: 0,
    itemsAvailable: [0,-1],
    itemSelected: 0,
    coins: 0,
    fromScreen: '',
    timesPlayed: 0,

    getHexValue: function(color) {
        var hexStr = Phaser.Color.RGBtoString(color.r, color.g, color.b, color.a, '#');
        return parseInt(hexStr.replace(/^#/, ''), 16);
    },

    save: function () {
        if (DataStorage.supportsLocalStorage()) {
            localStorage[this.namespace + ".muted"] = JSON.stringify(this.muted);
            localStorage[this.namespace + ".firstTime"] = JSON.stringify(this.firstTime);
            localStorage[this.namespace + ".lastNickname"] = JSON.stringify(this.lastNickname);
            localStorage[this.namespace + ".coins"] = JSON.stringify(this.coins);
            localStorage[this.namespace + ".itemSelected"] = JSON.stringify(this.itemSelected);
            localStorage[this.namespace + ".itemsAvailable"] = JSON.stringify(this.itemsAvailable);
            localStorage[this.namespace + ".timesPlayed"] = JSON.stringify(this.timesPlayed);
        }
        else {
            DataStorage.GlobalSettings.database.save('save',
                JSON.stringify(this.muted) + '#' +
                JSON.stringify(this.firstTime) + '#' +
                JSON.stringify(this.lastNickname) + '#' +
                JSON.stringify(this.coins) + '#' +
                JSON.stringify(this.itemSelected) + '#' +
                JSON.stringify(this.itemsAvailable) + '#' +
                JSON.stringify(this.timesPlayed), null);
        }
    },

    load: function () {
        if (DataStorage.supportsLocalStorage()) {
            if (localStorage[this.namespace + ".muted"]) {
                this.muted = JSON.parse(localStorage[this.namespace + ".muted"]);
            }
            if (localStorage[this.namespace + ".firstTime"]) {
                this.firstTime = JSON.parse(localStorage[this.namespace + ".firstTime"]);
            }
            if (localStorage[this.namespace + ".lastNickname"]) {
                this.lastNickname = JSON.parse(localStorage[this.namespace + ".lastNickname"]);
            }
            if (localStorage[this.namespace + ".coins"]) {
                this.coins = JSON.parse(localStorage[this.namespace + ".coins"]);
            }
            if (localStorage[this.namespace + ".itemSelected"]) {
                this.itemSelected = JSON.parse(localStorage[this.namespace + ".itemSelected"]);
            }
            if (localStorage[this.namespace + ".itemsAvailable"]) {
                var kites = JSON.parse(localStorage[this.namespace + ".itemsAvailable"]);
                if (kites) {
                    for (var i = 0; i < kites.length; i++) {
                        this.itemsAvailable[i] = kites[i];
                    }
                }
            }
            if (localStorage[this.namespace + ".timesPlayed"]) {
                this.timesPlayed = JSON.parse(localStorage[this.namespace + ".timesPlayed"]);
            }
        }
        else {
            var data = DataStorage.GlobalSettings.database.load('save');
            if (data && data.length > 0) {
                var loadedData = data.split('#');
                if (loadedData && loadedData.length === 7) {
                    this.muted = JSON.parse(loadedData[0]);
                    this.firstTime = JSON.parse(loadedData[1]);
                    this.lastNickname = JSON.parse(loadedData[2]);
                    this.coins = JSON.parse(loadedData[3]);
                    this.itemSelected = JSON.parse(loadedData[4]);

                    var kites = JSON.parse(loadedData[5]);
                    if (kites) {
                        for (var i = 0; i < kites.length; i++) {
                            this.itemsAvailable[i] = kites[i];
                        }
                    }

                    this.timesPlayed = JSON.parse(loadedData[6]);
                }
            }
        }
    }
};

Utils.BackgroundMusic = {
    load: function (game) {
        //this.bgm1 = game.add.audio('bgm1');
    }
};

Utils.MersenneTwister = function (seed) {
    'use strict';
    if (typeof seed === 'undefined') {
        seed = new Date().getTime();
    }

    this.MAX_INT = 4294967296.0;
    this.N = 624;
    this.M = 397;
    this.UPPER_MARK = 0x80000000;
    this.LOWER_MASK = 0x7fffffff;
    this.MATRIX_A = 0x9908b0df;

    this.mt = new Array(this.N);
    this.mti = this.N + 1;

    this.seed(seed);
};

Utils.MersenneTwister.prototype = {
    /**
     * Initializes the state vector by using one unsigned 32-bit integer "seed", which may be zero.
     *
     * @since 0.1.0
     * @param {number} seed The seed value.
     */
    seed: function (seed) {
        var s;

        this.mt[0] = seed >>> 0;

        for (this.mti = 1; this.mti < this.N; this.mti++) {
            s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] =
                (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
            this.mt[this.mti] >>>= 0;
        }
    },

    /**
 * Initializes the state vector by using an array key[] of unsigned 32-bit integers of the specified length. If
 * length is smaller than 624, then each array of 32-bit integers gives distinct initial state vector. This is
 * useful if you want a larger seed space than 32-bit word.
 *
 * @since 0.1.0
 * @param {array} vector The seed vector.
 */
    seedArray: function (vector) {
        var i = 1,
            j = 0,
            k = this.N > vector.length ? this.N : vector.length,
            s;

        this.seed(19650218);

        for (; k > 0; k--) {
            s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);

            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) +
                vector[j] + j;
            this.mt[i] >>>= 0;
            i++;
            j++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
            if (j >= vector.length) {
                j = 0;
            }
        }

        for (k = this.N - 1; k; k--) {
            s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] =
                (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i;
            this.mt[i] >>>= 0;
            i++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
        }

        this.mt[0] = 0x80000000;
    },

    /**
 * Generates a random unsigned 32-bit integer.
 *
 * @since 0.1.0
 * @returns {number}
 */
    int: function () {
        var y,
            kk,
            mag01 = new Array(0, this.MATRIX_A);

        if (this.mti >= this.N) {
            if (this.mti === this.N + 1) {
                this.seed(5489);
            }

            for (kk = 0; kk < this.N - this.M; kk++) {
                y = (this.mt[kk] & this.UPPER_MARK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 1];
            }

            for (; kk < this.N - 1; kk++) {
                y = (this.mt[kk] & this.UPPER_MARK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 1];
            }

            y = (this.mt[this.N - 1] & this.UPPER_MARK) | (this.mt[0] & this.LOWER_MASK);
            this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 1];
            this.mti = 0;
        }

        y = this.mt[this.mti++];

        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);

        return y >>> 0;
    },

    /**
 * Generates a random unsigned 31-bit integer.
 *
 * @since 0.1.0
 * @returns {number}
 */
    int31: function () {
        return this.int() >>> 1;
    },

    /**
     * Generates a random real in the interval [0;1] with 32-bit resolution.
     *
     * @since 0.1.0
     * @returns {number}
     */
    real: function () {
        return this.int() * (1.0 / (this.MAX_INT - 1));
    },

    /**
	* Returns a random real number between min and max
	* @method realInRange
	* @param {Number} min
	* @param {Number} max
	* @return {Number}
	*/
    realInRange: function (min, max) {

        min = min || 0;
        max = max || 0;

        return this.real() * (max - min) + min;

    },

    /**
	* Returns a random integer between min and max
	* @method integerInRange
	* @param {Number} min
	* @param {Number} max
	* @return {Number}
	*/
    integerInRange: function (min, max) {
        return Math.floor(this.realInRange(min, max));
    },

    /**
     * Generates a random real in the interval ]0;1[ with 32-bit resolution.
     *
     * @since 0.1.0
     * @returns {number}
     */
    realx: function () {
        return (this.int() + 0.5) * (1.0 / this.MAX_INT);
    },

    /**
     * Generates a random real in the interval [0;1[ with 32-bit resolution.
     *
     * @since 0.1.0
     * @returns {number}
     */
    rnd: function () {
        return this.int() * (1.0 / this.MAX_INT);
    },

    /**
     * Generates a random real in the interval [0;1[ with 53-bit resolution.
     *
     * @since 0.1.0
     * @returns {number}
     */
    rndHiRes: function () {
        var a = this.int() >>> 5,
            b = this.int() >>> 6;

        return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
    }


};