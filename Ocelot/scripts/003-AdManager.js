Utils.AdManager = function () {
    this.listener = null;
};

Utils.AdManager.prototype = {
    setListener: function (l) {
        this.listener = l;
    },

    loadAds: function () {
        if (navigator.isCocoonJS) {
            var bannerConfig = "ca-app-pub-1299265548534590/2541760460";
            var interstitialConfig = "ca-app-pub-1299265548534590/9925426463";
            
            if (Phaser.Device.iOS) {
                bannerConfig = "ca-app-pub-1299265548534590/8169491662";
                interstitialConfig = "ca-app-pub-1299265548534590/3599691268";
            }

            this.banner = Cocoon.Ad.AdMob.createBanner(bannerConfig);
            this.bannerLoaded = false;
            if (this.banner) {
                this.banner.on("load", function () {
                    this.banner.setLayout(Cocoon.Ad.BannerLayout.TOP_CENTER);
                    this.bannerLoaded = true;
                }.bind(this));
                this.banner.load();
            }

            this.interstitialLoaded = false;
            this.interstitial = Cocoon.Ad.AdMob.createInterstitial(interstitialConfig);
            if (this.interstitial) {
                this.interstitial.on("load", function () {
                    this.interstitialLoaded = true;
                }.bind(this));
                this.interstitial.load();
            }
        }
    }
};

Utils.adManager = new Utils.AdManager();