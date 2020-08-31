const AccessControl = require('accesscontrol');
const access = new AccessControl();

exports.roles = (function () {
    access.grant('basic') // AccessControl method, giving authorizations on 'profile'
        .readOwn('sauce')
        .updateOwn('sauce')
        .deleteAny('sauce')

    access.grant('admin')
        .extend('basic') // inherits all attributes from 'basic'
        .readAny('sauce') // then add own attributes
        .updateAny('sauce')
        .deleteAny('sauce')

    return access;
})();