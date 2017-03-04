exports.schemadata = function () {
    var sugarSchema;
    var SQLSchema;

    // sets the Sugar schema data for future use
    this.setSugarSchema = function (sugarS) {
        if (sugarS) {
            sugarSchema = sugarS;
            console.log('>>Sugar schema saved');
        } else {
            console.log('>>ERROR: requested to save Sugar schema, but no schema provided.');
        };
    };

    //takes a table schema pulled from sugarSchema.modules[tName], and turns it into another well formed modules schema
    //which is formatted as follows:
    //      {"modules": { "<tName>" : { "fields": { "<fieldkey>": <type>, ... } } }
    this.buildTableSchema = function (tName, tSchema) {
        return JSON.parse('{"modules": {"' + tName + '": ' + JSON.stringify(tSchema) + '}}');
    };

    // returns the Sugar schema for a single table
    this.getSugarTableSchema = function (tName, altTName) {
        var tableName = tName;
        if (altTName) tableName = altTName;
        var tableSchema = sugarSchema.modules[tName];
        if (tableSchema) {
            return this.buildTableSchema(tableName, tableSchema);
        } else {
            console.log('>>ERROR: table ' + tName + ' not found in sugar schema.');
            return False;
        };
    };

    // returns the list of Sugar tables
    this.listSugarTables = function () {
        if (sugarSchema) {
            var tableList = [];
            for (var tablekey in sugarSchema.modules) {
                console.log(tablekey);
                tableList.push(tablekey);
            }
            return tableList;
        } else {
            console.log('>>WARN: no sugar schema available... nothing to list');
        };
    };

    // returns the list of SQL tables
    this.listSQLTables = function () {
        if (SQLSchema) {
            var tableList = [];
            for (var tablekey in SQLSchema.tables) {
                console.log(tablekey);
                tableList.push(tablekey);
            }
            return tableList;
        } else {
            console.log('>>WAR: no SQL schema available... nothing to list');
        };
    };

    this.setSQLSchema = function (SQLS) {
        if (SQLS) {
            SQLSchema = SQLS;
            console.log('>>SQL Server schema saved');
        } else {
            console.log('>>ERROR: requested to save SQL Server schema, but no schema provided.');
        };
    };

    this.getSQLTableSchema = function (tName) {
        console.log('>>not implemented yet');
        return null;
    };
};