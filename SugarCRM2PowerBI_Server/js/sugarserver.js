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
    var SugarSchema;

    // GetSchema gets the schema from SugarCRM
    this.GetSchema = function myself() {
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
            console.log('>>Requesting schema from SugarCRM...');
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                SugarSchema = JSON.parse(body);
                console.log('>>SugarCRM schema received');
            });
        };
    };

    //ListTables lists all the tables to the console
    this.ListTables = function () {
        if (SugarSchema) {
            for (var tablekey in SugarSchema.modules) {
                console.log(tablekey);
            }
        } else {
            console.log('>>WARN: no sugar schema available... nothing to list');
        };
    };

    //Schema returns the schema of the input table if provided, otherwise it returns the entire schema
    this.Schema = function (tName) {
        if (!SugarSchema) {
            console.log('>>No SugarCRM schema available.  Request schema from SugarCRM first.');
            return null;
        } else {
            // if a table was requested then look for that table, otherwise return all the schema
            if (tName) {
                var tSchema;
                //find the table schema and return that
                for (var tablekey in SugarSchema.modules) {
                    if (tablekey == tName) {
                        tSchema = JSON.parse('{ "modules": { "' + tablekey + '": ' + JSON.stringify(SugarSchema.modules[tablekey]) + ' }}');
                        return tSchema;
                    };
                };
                //if we got here, we didn't find the table that was requested, so we return False so SQL doesn't continue
                return False;
            } else {
                //return the entire schema
                return SugarSchema;
            };
        };
    };

    //getTableData returns the data from the selected SugarCRM table
    this.getTableData = function myself (tName) {
        if (!tName) {
            console.log('>>ERROR: no table name provided to getTableData.');
            return null;
        } else {
            var tData;
            //todo: get the table data from SugarCRM
        };
    };
};


