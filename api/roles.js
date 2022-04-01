const AccessControl = require("accesscontrol");
const ac = new AccessControl();

// define roles
// enum: ["normalUser", "adminUser", "subsUser"]

exports.roles = (() => {
    ac.grant("normalUser")
        .readOwn("profile")
        .updateOwn("profile")

    ac.grant("subsUser")
        .extend("normalUser")
        .readAny("profile")

    ac.grant("adminUser")
        .extend("normalUser")
        .extend("subsUser")
        .updateAny("profile")
        .deleteAny("profile")

    return ac;
})();