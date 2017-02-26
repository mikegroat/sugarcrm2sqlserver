var request = require("request");

exports.sugar = function () {
    var SugarUserName = '';
    var SugarPassword = '';
    var accessToken = '';
    var refreshToken = '';
    var accountOffset = 0;
    var sugarSchema = '';

    this.setUserName = function (uname) {
        if (uname) {
            SugarUserName = uname;
            console.log('>>SugarUserName set to "' + SugarUserName + '"');
        } else console.log(">>ERROR: no sugar username provided");
    };

    this.setPassword = function (pword) {
        if (pword) {
            SugarPassword = pword;
            console.log('>>SugarPassword set to "' + SugarPassword + '"');
        } else console.log(">>ERROR: no sugar username provided");
    };

    this.GetSugarToken = function () {
        var Tokenoptions = {
            method: 'POST',
            url: 'https://daon.sugarondemand.com/rest/v10/oauth2/token/',
            headers:
            {
                'postman-token': '6f4505ce-c417-2e4f-66e1-428e7ecefb6f',
                'cache-control': 'no-cache'
            },
            body: '{\n  "grant_type" : "password",\n  "client_id" : "sugar",\n  "client_secret" : "",\n  "username" : "' + SugarUserName + '",\n  "password" : "' + SugarPassword + '",\n  "platform" : "api"\n}'
        };

        if (SugarUserName == '' || SugarPassword == '') {
            console.log('>>Blank Username and/or Password... no token requested');
        } else {
            request(Tokenoptions, function (error, response, body) {
                if (error) throw new Error(error);

                console.log(body);
                accessToken = JSON.parse(body).access_token;
                refreshToken = JSON.parse(body).refresh_token;
            });
        };
    };

    var fullacctset = [];
    var nextoffset = 0;

    this.GetSchema = function myself(callback) {
        var carryon = true;
        var curracctset = '';
        var returnedJSON = '';
        var fullurl = 'https://daon.sugarondemand.com/rest/v10/metadata'
        var options = {
            method: 'GET',
            url: fullurl,
            headers:
            {
                'postman-token': 'f2ce0c00-35c1-dd0e-daa8-b021eb0ff287',
                'cache-control': 'no-cache',
                'oauth-token': accessToken
            }
        };

        if (accessToken == '') {
            console.log('No login token available... schema not requested');
        } else {
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                callback(JSON.parse(body));
            });
        };
    };

};


