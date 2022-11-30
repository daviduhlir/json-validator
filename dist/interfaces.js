"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValidatorAdditionalProperties = exports.JsonValidatorArrayUnique = exports.JsonValidatorRequired = exports.JsonValidatorType = exports.JsonValidatorTransforms = exports.ObjectId = void 0;
const typechecks_1 = require("./utils/typechecks");
class ObjectId extends String {
}
exports.ObjectId = ObjectId;
exports.JsonValidatorTransforms = {
    toFloat: ((value) => {
        if (typechecks_1.isString(value)) {
            return parseFloat(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toFloat is not string`);
    }),
    toInteger: ((value) => {
        if (typechecks_1.isString(value)) {
            return parseInt(value, 10);
        }
        throw new Error(`Input of JsonValidatorTransforms.toInteger is not string`);
    }),
    toObjectId: ((value) => {
        if (typechecks_1.isString(value)) {
            return new ObjectId(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toObjectId is not string`);
    }),
    toDate: ((value) => {
        if (typechecks_1.isString(value)) {
            return new Date(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toDate is not string`);
    }),
};
var JsonValidatorType;
(function (JsonValidatorType) {
    JsonValidatorType["Any"] = "Any";
    JsonValidatorType["Boolean"] = "Boolean";
    JsonValidatorType["Number"] = "Number";
    JsonValidatorType["String"] = "String";
    JsonValidatorType["Password"] = "Password";
    JsonValidatorType["Enum"] = "Enum";
    JsonValidatorType["Array"] = "Array";
    JsonValidatorType["Object"] = "Object";
})(JsonValidatorType = exports.JsonValidatorType || (exports.JsonValidatorType = {}));
var JsonValidatorRequired;
(function (JsonValidatorRequired) {
    JsonValidatorRequired["True"] = "True";
    JsonValidatorRequired["False"] = "False";
})(JsonValidatorRequired = exports.JsonValidatorRequired || (exports.JsonValidatorRequired = {}));
exports.JsonValidatorArrayUnique = '';
var JsonValidatorAdditionalProperties;
(function (JsonValidatorAdditionalProperties) {
    JsonValidatorAdditionalProperties["Reject"] = "Reject";
    JsonValidatorAdditionalProperties["Remove"] = "Remove";
})(JsonValidatorAdditionalProperties = exports.JsonValidatorAdditionalProperties || (exports.JsonValidatorAdditionalProperties = {}));
//# sourceMappingURL=interfaces.js.map