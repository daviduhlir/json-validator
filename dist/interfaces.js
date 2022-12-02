"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValidatorAdditionalProperties = exports.JsonValidatorArrayUnique = exports.JsonValidatorRequired = exports.JsonValidatorType = void 0;
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