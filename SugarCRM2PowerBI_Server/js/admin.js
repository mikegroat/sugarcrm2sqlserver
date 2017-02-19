//
// admin.js is the javascript file that handles all the arguments passed to the SugarCRM2PowerBI_Server process at execution or via stdin
//

//todo: change the switches in the startup and stdin arguments to reflect the correct arguments for this
var http = require("https");
var request = require("request");
var userName = '';
var passWord = '';
var accessToken = '';
var refreshToken = '';
var accountOffset = 0;

var GetToken = function () {
    var Tokenoptions = {
        method: 'POST',
        url: 'https://daon.sugarondemand.com/rest/v10/oauth2/token/',
        headers:
        {
            'postman-token': '6f4505ce-c417-2e4f-66e1-428e7ecefb6f',
            'cache-control': 'no-cache'
        },
        body: '{\n  "grant_type" : "password",\n  "client_id" : "sugar",\n  "client_secret" : "",\n  "username" : "' + userName + '",\n  "password" : "' + passWord + '",\n  "platform" : "api"\n}'
    };

    request(Tokenoptions, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
        accessToken = JSON.parse(body).access_token;
        refreshToken = JSON.parse(body).refresh_token;
    });
};

var fullacctset = [];
var nextoffset = 0;

var GetAccounts = function () {
    var carryon = true;
    var curracctset = '';
    var returnedJSON = '';
    var fullurl = 'https://daon.sugarondemand.com/rest/v10/Accounts'
    var options = {
        method: 'GET',
        url: fullurl + "&offset=" + nextoffset,
        headers:
        {
            'postman-token': 'f2ce0c00-35c1-dd0e-daa8-b021eb0ff287',
            'cache-control': 'no-cache',
            'oauth-token': accessToken
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

//        console.log(body);
        returnedJSON = body;
        curracctset = JSON.parse(returnedJSON).records;
        fullacctset = fullacctset.concat(curracctset);
        nextoffset = JSON.parse(returnedJSON).next_offset;
        console.log("\noffset = " + nextoffset);
        if (nextoffset >= 0) {
            GetAccounts();
        } else {
            console.log("\nAccount Fetch Completed!");
            console.log("\nFetched " + fullacctset.length + " accounts.");
            nextoffset = 0;
        };
    });
};



exports.init = function () {
    console.log("Initializing...");
    process.argv.forEach(function (val, index, array) {
        if (index > 1) {
            var argType = val.substr(0, val.indexOf('=', 0));
            var arg = val.substring(val.indexOf('=') + 1, val.length);
            switch (argType) {
                case 'username':
                    userName = parseInt(arg);
                    console.log('username set\n');
                    break;
                case 'password':
                    passWord = parseInt(arg);
                    console.log('password set\n');
                    break;
                default:
                    console.log('Invalid argument: ' + val);
            }
        }
    });
    process.stdin.on('readable', function () {
        var chunk = process.stdin.read();
        if (chunk !== null) {
            var temp = chunk.toString();
            temp = temp.replace(/[\W]/ig, ' ');
            var argType = temp.substr(0, temp.indexOf(' ', 0));
            var argVal = temp.substr(temp.indexOf(' ') + 1, temp.length-temp.indexOf(' ')-3);
            console.log(' ');
            switch (argType) {
                case 'kill':
                    console.log('>>exiting');
                    process.exit();
                    break;
                case 'stats':
                    console.log('>>stats requested... feature not yet enabled');
                    break;
                case 'username':
                    userName = argVal;
                    console.log('>>username set to "' + userName + '"');
                    break;
                case 'password':
                    passWord = argVal;
                    console.log('>>password set to "' + passWord +'"');
                    break;
                case 'token':
                    if (userName == '' || passWord == '') {
                        console.log('Blank Username and/or Password... no token requested');
                        break;
                    } else {
                        GetToken();
                    }
                    break;
                case 'accounts':
                    if (accessToken == '') {
                        console.log('No login token available... accounts not requested');
                        break;
                    }
                    GetAccounts();
                    break;
                case 'pause':
                    if (genWordInterval != 0) {
                        console.log('>>pause requested... feature not yet enabled');
                        clearInterval(genWordInterval);
                        genWordInterval = 0;
                    } else console.log('>>already paused');
                    console.log(' ');
                    break;
                case 'unpause':
                    if (genWordInterval == 0) {
                        console.log('>>unpause requested... feature not yet enabled');
                        genWordInterval = setInterval(genWord, wordIntervalLength);
                    } else console.log('>>already unpaused');
                    console.log(' ');
                    break;
                case 'interval':
                    wordIntervalLength = parseInt(argVal);
                    console.log('>>new update interval requested... feature not yet enabled');
                    break;
                case 'help':
                    console.log('>>help - prints out this screen');
                    console.log('>>interval nnn - changes the delay between SugarCRM data transfers to nnn minutes');
                    console.log('>>kill - stops this process completely');
                    console.log('>>memory - gives you stats on memory usage of the SugarCRM data transfer process');
                    console.log('>>pause - pauses SugarCRM data transfer');
                    console.log('>>stats - prints the SugarCRM data transfer statistics since this process has been running');
                    console.log('>>unpause- unpauses SugarCRM data transfer');
                    console.log('>>uptime - prints the duration that the SugarCRM data transfer process has been running');
                    console.log(' ');
                    break;
                case 'memory':
                    console.log('>>' + JSON.stringify(process.memoryUsage()));
                    console.log(' ');
                    break;
                case 'uptime':
                    var daysUp = (Math.round(process.uptime() / (3600 * 24))).toString();
                    if (daysUp.length == 1) daysUp = '0' + daysUp;
                    var hoursUp = (Math.round(process.uptime() / 3600) % 24).toString();
                    if (hoursUp.length == 1) hoursUp = '0' + hoursUp;
                    var minutesUp = (Math.round(process.uptime() / 60) % (60 * 24)).toString();
                    if (minutesUp.length == 1) minutesUp = '0' + minutesUp;
                    var secondsUp = (Math.round(process.uptime() % 60)).toString();
                    if (secondsUp.length == 1) secondsUp = '0' + secondsUp;
                    console.log('>>crawler has been up for ' + daysUp + ':' + hoursUp + ':' + minutesUp + ':' + secondsUp + ' (dd:hh:mm:ss)');
                    console.log(' ');
                    break;
                default:
                    console.log('>>invalid command: "' + argType + '"');
                    console.log('>>type "help" for a list of commands');
                    console.log(' ');
            }
        }
    });
    console.log("Ready.\n");
};