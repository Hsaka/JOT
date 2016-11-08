var DataStorage = {};

DataStorage.Database = function (syscookie) {
    this.systemcookie = syscookie;
};

DataStorage.Database.prototype = {
    save: function (key, value, dateOffset) {
        var date = new Date();
        date.setTime(date.getTime() + ((dateOffset ? dateOffset : 365 * 10) * 24 * 60 * 60 * 1000));
        document.cookie = this.systemcookie + "~" + key + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
    },

    load: function (key) {
        var nameeq = this.systemcookie + "~" + key + "=";
        var ca = document.cookie.split(";");
        var rt;
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameeq) == 0) {
                rt = c.substring(nameeq.length, c.length);
                return rt;
            }
        }
        return null;
    }
};

DataStorage.supportsLocalStorage = function () {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
};

DataStorage.GlobalSettings = {
    database: new DataStorage.Database('gamepyong_'+Utils.GlobalSettings.namespace)
};