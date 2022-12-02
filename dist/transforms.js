"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValidatorTransforms = void 0;
const typechecks_1 = require("./utils/typechecks");
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
    toDate: ((value) => {
        if (typechecks_1.isString(value)) {
            return new Date(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toDate is not string`);
    }),
};
//# sourceMappingURL=transforms.js.map