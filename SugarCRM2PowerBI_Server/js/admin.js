//
// admin.js is the javascript file that handles all the arguments passed to the SugarCRM2PowerBI_Server process at execution or via stdin
//

//todo: change the switches in the startup and stdin arguments to reflect the correct arguments for this
var http = require("https");
var sqlserver = require("./sqlserver");
var sql = new sqlserver.sql();
var sugarserver = require("./sugarserver");
var sugar = new sugarserver.sugar();
var dataset = require("./dataset");
var data = new dataset.data();
var Schemas = require("./schemas");
var schemas = new Schemas.schemadata();
var sqlString = '';

exports.init = function () {
    console.log("Initializing...");
    process.argv.forEach(function (val, index, array) {
        if (index > 1) {
            var argType = val.substr(0, val.indexOf(' ', 0));
            var argVal = val.substring(val.indexOf(' ') + 1, val.length);
            switch (argType) {
                case 'sugar_username':
                    sugar.setUserName(argVal);
                    break;
                case 'sugar_password':
                    sugar.setPassword(argVal);
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
                case 'sugar_username':
                    sugar.setUserName(argVal);
                    break;
                case 'sugar_password':
                    sugar.setPassword(argVal);
                    break;
                case 'sql_username':
                    sql.setUserName(argVal);
                    break;
                case 'sql_password':
                    sql.setPassword(argVal);
                    break;
                case 'token':
                    sugar.GetSugarToken();
                    break;
                case 'get_sugar_schema':
                    sugar.GetSchema(schemas.setSugarSchema);
                    break;
                case 'get_SQL_schema':
                    schemas.setSQLSchema(sql.GetSchema());
                    break;
                case 'accounts':
                    sugar.GetAccounts(data.accounts);
                    break;
                case 'acct_structure':
                    data.account_structure();
                    break;
                case 'pause':
//                    if (genWordInterval != 0) {
                        console.log('>>pause requested... feature not yet enabled');
//                        clearInterval(genWordInterval);
//                        genWordInterval = 0;
//                    } else console.log('>>already paused');
//                    console.log(' ');
                    break;
                case 'unpause':
//                    if (genWordInterval == 0) {
                        console.log('>>unpause requested... feature not yet enabled');
//                        genWordInterval = setInterval(genWord, wordIntervalLength);
//                    } else console.log('>>already unpaused');
//                    console.log(' ');
                    break;
                case 'query':
                    sql.doQuery();
                    break;
                case 'table':
                    sql.genSchema(schemas.getSugarTableSchema(argVal));
                    break;
                case 'populate':
                    sugar.getTableData(argVal, function (records) {
                        sql.populateTable(schemas.getSugarTableSchema(argVal, 'temp_'+argVal), records, argVal);
                    });
                    break;
                case 'connect':
                    sql.connect();
                    break;
                case 'interval':
                    wordIntervalLength = parseInt(argVal);
                    console.log('>>new update interval requested... feature not yet enabled');
                    break;
                case 'list_sugar_tables':
                    schemas.listSugarTables();
                    break;
                case 'list_sql_tables':
                    schemas.listSQLTables();
                    break;
                case 'set_query':
                    sql.setQuery(argVal);
                    break;
                case 'show_query':
                    console.log(sql.getQuery());
                    break;
                case 'show_field_list':
                    sql.showFieldList(schemas.getSugarTableSchema(argVal));
                    break;
                case 'help':
                    console.log('>>accounts - requests all the accounts from SugarCRM');
                    console.log('>>acct_structure - generates a string that defines the structure of the accounts table');
                    console.log('>>connect - connects to the SQL Server database');
                    console.log('>>get_sugar_schema - gets and stores the SugarCRM schema');
                    console.log('>>get_SQL_schema - gets and stores the SQL Server schema');
                    console.log('>>help - prints out this screen');
                    console.log('>>interval nnn - changes the delay between SugarCRM data transfers to nnn minutes');
                    console.log('>>kill - stops this process completely');
                    console.log('>>list_sugar_tables - lists all the tables in the Sugar schema');
                    console.log('>>memory - gives you stats on memory usage of the SugarCRM data transfer process');
                    console.log('>>pause - pauses SugarCRM data transfer');
                    console.log('>>populate <tablename> - gets the data for the table from sugar and populates it into SQL Server');
                    console.log('>>query - executes the last generated SQL query against the SQL Server database');
                    console.log('>>set_query <query> - sets the query string to the query provided');
                    console.log('>>show_field_list <tablename> - shows the list of fields for that table with both the Sugar and SQL types they are converted to');
                    console.log('>>show_query - shows the last query statement that was generated');
                    console.log('>>sql_password - enters the password for the SQL Server');
                    console.log('>>sql_username - enters the username for the SQL Server');
                    console.log('>>stats - prints the SugarCRM data transfer statistics since this process has been running');
                    console.log('>>sugar_password - enters the password for SugarCRM');
                    console.log('>>sugar_username - enters the username for SugarCRM');
                    console.log('>>table <tablename> - creates the SQL Server schema for that table');
                    console.log('>>token - requests the SugarCRM oauth token');
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