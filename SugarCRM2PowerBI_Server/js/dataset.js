exports.data = function () {
    var account_array = [];

    this.accounts = function (accts) {
        account_array = accts;
    };

    this.struc_string = '';

    this.account_structure = function () {
        if (account_array.length == 0) {
            console.log(">>ERROR: empty account array... no structure provided");
        } else {
            var obj = account_array[1];
            for (var key in obj) {
                var attrName = key;
                var attrValue = obj[key];
                if (this.struc_string == '') {
                    this.struc_string = attrName
                } else {
                    this.struc_string = this.struc_string + ", " + attrName;
                };
            };
            account_structure = this.struc_string;
            console.log(">>account structure: \n" + this.struc_string);
        };
    };
};