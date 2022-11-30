"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValidatorUtils = exports.JsonValidator = exports.required = void 0;
const typechecks_1 = require("./utils/typechecks");
const array_1 = require("./utils/array");
const interfaces_1 = require("./interfaces");
const errors_1 = require("./errors");
function required(input) {
    return {
        ...input,
        required: interfaces_1.JsonValidatorRequired.True,
    };
}
exports.required = required;
class JsonValidator {
    static objectValidator(input, schema, additinalProperties = interfaces_1.JsonValidatorAdditionalProperties.Remove) {
        if (!input) {
            throw new errors_1.JsonValidationError('Object is empty');
        }
        if (!typechecks_1.isObject(input) || typechecks_1.isArray(input)) {
            throw new errors_1.JsonValidationError('Input is not object');
        }
        return JsonValidator.validate(input, {
            type: interfaces_1.JsonValidatorType.Object,
            childs: schema,
            additinalProperties,
        });
    }
    static validate(content, schema, parentKey = '', key = '') {
        const validators = {
            [interfaces_1.JsonValidatorType.Any]: JsonValidator.validateAny,
            [interfaces_1.JsonValidatorType.Boolean]: JsonValidator.validateBoolean,
            [interfaces_1.JsonValidatorType.String]: JsonValidator.validateString,
            [interfaces_1.JsonValidatorType.Password]: JsonValidator.validatePassword,
            [interfaces_1.JsonValidatorType.Number]: JsonValidator.validateNumber,
            [interfaces_1.JsonValidatorType.Enum]: JsonValidator.validateEnum,
            [interfaces_1.JsonValidatorType.Array]: JsonValidator.validateArray,
            [interfaces_1.JsonValidatorType.Object]: JsonValidator.validateObject,
        };
        if (validators[schema.type]) {
            if (content === null && schema.nullable) {
                return null;
            }
            if (typechecks_1.isFunction(schema.parseTransform)) {
                content = schema.parseTransform(content);
            }
            let output = validators[schema.type](parentKey, key, content, schema);
            if (typechecks_1.isFunction(schema.outputTransform)) {
                output = schema.outputTransform(output);
            }
            return output;
        }
        throw new Error(`Type ${schema.type} is not supported`);
    }
    static validateAny(parentKey, key, content, schema) {
        return content;
    }
    static validateBoolean(parentKey, key, content, schema) {
        if (typechecks_1.isBoolean(content)) {
            return content;
        }
        throw new errors_1.JsonValidationFieldError([
            {
                field: `${parentKey}${key}`,
                message: `Must be boolean`,
                humanKeyName: schema.humanKeyName,
                fieldDescription: schema.description,
            },
        ]);
    }
    static validateString(parentKey, key, content, schema) {
        if (typechecks_1.isString(content)) {
            if (!typechecks_1.isUndefined(schema.minLength)) {
                if (content.length < schema.minLength) {
                    throw new errors_1.JsonValidationFieldError([
                        {
                            field: `${parentKey}${key}`,
                            message: `Minimal length is ${schema.minLength}`,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        },
                    ]);
                }
            }
            if (!typechecks_1.isUndefined(schema.maxLength)) {
                if (content.length > schema.maxLength) {
                    throw new errors_1.JsonValidationFieldError([
                        {
                            field: `${parentKey}${key}`,
                            message: `Maximal length is ${schema.maxLength}`,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        },
                    ]);
                }
            }
            if (schema.regexp) {
                let regExp = null;
                let message = `Doesn't match validation RegExp`;
                if (typechecks_1.isRegExp(schema.regexp)) {
                    regExp = schema.regexp;
                }
                else {
                    regExp = schema.regexp.regexp;
                    message = schema.regexp.message;
                }
                if (regExp.test(content)) {
                    if (schema.asDate) {
                        const date = new Date(content);
                        if (!typechecks_1.isDate(date) || isNaN(date.getTime())) {
                            throw new errors_1.JsonValidationFieldError([
                                {
                                    field: `${parentKey}${key}`,
                                    message: `Invalid date value`,
                                    humanKeyName: schema.humanKeyName,
                                    fieldDescription: schema.description,
                                },
                            ]);
                        }
                        return date;
                    }
                    else {
                        return content;
                    }
                }
                else {
                    throw new errors_1.JsonValidationFieldError([
                        {
                            field: `${parentKey}${key}`,
                            message,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        },
                    ]);
                }
            }
            else {
                if (schema.asDate) {
                    const date = new Date(content);
                    if (!(date instanceof Date) || isNaN(date.getTime())) {
                        throw new errors_1.JsonValidationFieldError([
                            {
                                field: `${parentKey}${key}`,
                                message: `Invalid date value`,
                                humanKeyName: schema.humanKeyName,
                                fieldDescription: schema.description,
                            },
                        ]);
                    }
                    return date;
                }
                else {
                    return content;
                }
            }
        }
        throw new errors_1.JsonValidationFieldError([
            {
                field: `${parentKey}${key}`,
                message: `Must be string`,
                humanKeyName: schema.humanKeyName,
                fieldDescription: schema.description,
            },
        ]);
    }
    static validatePassword(parentKey, key, content, schema) {
        return JsonValidator.validateString(parentKey, key, content, schema);
    }
    static validateNumber(parentKey, key, content, schema) {
        if (typechecks_1.isNumber(content) && !isNaN(content)) {
            if (!typechecks_1.isUndefined(schema.min)) {
                if (content < schema.min) {
                    throw new errors_1.JsonValidationFieldError([
                        {
                            field: `${parentKey}${key}`,
                            message: `Minimal value is ${schema.min}`,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        },
                    ]);
                }
            }
            if (!typechecks_1.isUndefined(schema.max)) {
                if (content > schema.max) {
                    throw new errors_1.JsonValidationFieldError([
                        {
                            field: `${parentKey}${key}`,
                            message: `Maximal value is ${schema.max}`,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        },
                    ]);
                }
            }
            if (schema.asInteger && !Number.isInteger(content)) {
                throw new errors_1.JsonValidationFieldError([
                    {
                        field: `${parentKey}${key}`,
                        message: `Must be integer, not float`,
                        humanKeyName: schema.humanKeyName,
                        fieldDescription: schema.description,
                    },
                ]);
            }
            return content;
        }
        throw new errors_1.JsonValidationFieldError([
            {
                field: `${parentKey}${key}`,
                message: `Must be number`,
                humanKeyName: schema.humanKeyName,
                fieldDescription: schema.description,
            },
        ]);
    }
    static validateEnum(parentKey, key, content, schema) {
        if (!typechecks_1.isArray(schema.enum)) {
            throw new Error(`Missing 'enum' field in '${parentKey}${key}' format`);
        }
        if (typechecks_1.isString(content) && schema.enum.indexOf(content) > -1) {
            return content;
        }
        throw new errors_1.JsonValidationFieldError([
            {
                field: `${parentKey}${key}`,
                message: `Must be one of following values [${schema.enum}]`,
                humanKeyName: schema.humanKeyName,
                fieldDescription: schema.description,
            },
        ]);
    }
    static validateArray(parentKey, key, content, schema) {
        if (!schema.of) {
            throw new Error(`Missing 'of' field in '${parentKey}${key}' format`);
        }
        if (typechecks_1.isArray(content)) {
            if (!typechecks_1.isUndefined(schema.minLength)) {
                if (content.length < schema.minLength) {
                    throw new errors_1.JsonValidationFieldError([
                        {
                            field: `${parentKey}${key}`,
                            message: `Must have minimal length of ${schema.minLength} items`,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        },
                    ]);
                }
            }
            if (!typechecks_1.isUndefined(schema.maxLength)) {
                if (content.length > schema.maxLength) {
                    throw new errors_1.JsonValidationFieldError([
                        {
                            field: `${parentKey}${key}`,
                            message: `Must have maximal length of ${schema.maxLength} items`,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        },
                    ]);
                }
            }
            const acumulatedErrors = [];
            if (typechecks_1.isString(schema.unique)) {
                array_1.findDuplicities(content, schema.unique).forEach(index => {
                    acumulatedErrors.push({
                        field: `${parentKey}${key}[${index}]${schema.unique ? '.' + schema.unique : schema.unique}`,
                        message: `Items must be unique`,
                        humanKeyName: schema.humanKeyName,
                    });
                });
            }
            content.forEach((item, index) => {
                try {
                    JsonValidator.validate(item, schema.of, `${parentKey}${key}`, `[${index}]`);
                }
                catch (e) {
                    if (e instanceof errors_1.JsonValidationFieldError) {
                        acumulatedErrors.push(...e.details);
                    }
                    else {
                        throw e;
                    }
                }
            });
            if (acumulatedErrors.length) {
                throw new errors_1.JsonValidationFieldError(array_1.flatten(acumulatedErrors));
            }
            return content;
        }
        throw new errors_1.JsonValidationFieldError([
            {
                field: `${parentKey}${key}`,
                message: `Must be array`,
                humanKeyName: schema.humanKeyName,
                fieldDescription: schema.description,
            },
        ]);
    }
    static validateObject(parentKey, key, content, schema) {
        if ((!schema.childs || !typechecks_1.isObject(schema.childs)) && !schema.of) {
            throw new Error(`Missing 'childs' or 'of' field in '${parentKey}${key}' format`);
        }
        if (typechecks_1.isObject(content) && !typechecks_1.isArray(content)) {
            const objKeys = schema.childs ? Object.keys(schema.childs) : Object.keys(content);
            const outObject = {};
            const acumulatedErrors = [];
            objKeys.forEach(objKey => {
                try {
                    let newParentKey = `${parentKey}${key}.`;
                    if (newParentKey === '.') {
                        newParentKey = '';
                    }
                    if (schema.keysRegexp) {
                        let regExp = null;
                        let message = `Doesn't match validation RegExp`;
                        if (schema.keysRegexp instanceof RegExp) {
                            regExp = schema.keysRegexp;
                        }
                        else {
                            regExp = schema.keysRegexp.regexp;
                            message = schema.keysRegexp.message;
                        }
                        if (!regExp.test(objKey)) {
                            throw new errors_1.JsonValidationFieldError([
                                {
                                    field: `${parentKey}${key}.${objKey}`,
                                    isOnKey: true,
                                    message,
                                    fieldDescription: schema.description,
                                },
                            ]);
                        }
                    }
                    if (!typechecks_1.isUndefined(content[objKey])) {
                        outObject[objKey] = JsonValidator.validate(content[objKey], schema.childs ? schema.childs[objKey] : schema.of, newParentKey, objKey);
                    }
                    else if (schema.childs && schema.childs[objKey].required === interfaces_1.JsonValidatorRequired.True) {
                        throw new errors_1.JsonValidationFieldError([
                            {
                                field: `${newParentKey}${objKey}`,
                                message: `Missing required field`,
                                humanKeyName: schema.humanKeyName,
                                fieldDescription: schema.description,
                            },
                        ]);
                    }
                }
                catch (e) {
                    if (e instanceof errors_1.JsonValidationFieldError) {
                        acumulatedErrors.push(...e.details);
                    }
                    else {
                        throw e;
                    }
                }
            });
            if (acumulatedErrors.length) {
                throw new errors_1.JsonValidationFieldError(array_1.flatten(acumulatedErrors));
            }
            const additinalProperties = schema.additinalProperties ? schema.additinalProperties : interfaces_1.JsonValidatorAdditionalProperties.Remove;
            if (additinalProperties === interfaces_1.JsonValidatorAdditionalProperties.Reject) {
                const keysContent = Object.keys(content);
                const keysOut = Object.keys(outObject);
                if (keysContent.length > keysOut.length) {
                    const diff = array_1.arrayDiff(keysContent, keysOut);
                    throw new errors_1.JsonValidationFieldError(diff.map((additionalKey) => ({
                        field: `${parentKey}${key}.${additionalKey}`,
                        message: `Additional keys is not allowed`,
                        humanKeyName: schema.humanKeyName,
                        fieldDescription: schema.description,
                    })));
                }
            }
            return {
                ...outObject,
            };
        }
        throw new errors_1.JsonValidationFieldError([
            {
                field: `${parentKey}${key}`,
                message: `Must be object`,
                humanKeyName: schema.humanKeyName,
                fieldDescription: schema.description,
            },
        ]);
    }
}
exports.JsonValidator = JsonValidator;
class JsonValidatorUtils {
    static getAllKeys(schema, finalTypes = [
        interfaces_1.JsonValidatorType.Any,
        interfaces_1.JsonValidatorType.Boolean,
        interfaces_1.JsonValidatorType.Number,
        interfaces_1.JsonValidatorType.String,
        interfaces_1.JsonValidatorType.Enum,
    ]) {
        return JsonValidatorUtils.internalGetAllKeys(schema, finalTypes);
    }
    static internalGetAllKeys(schema, finalTypes, acc = {}, prefix = '') {
        if (finalTypes.includes(schema.type)) {
            acc[prefix] = schema;
            return acc;
        }
        else if (schema.type === interfaces_1.JsonValidatorType.Object) {
            const keys = Object.keys(schema.childs);
            keys.forEach(key => JsonValidatorUtils.internalGetAllKeys(schema.childs[key], finalTypes, acc, `${prefix ? prefix + '.' : ''}${schema.childs[key].required !== interfaces_1.JsonValidatorRequired.True ? '?' : ''}${key}`));
            return acc;
        }
        else if (schema.type === interfaces_1.JsonValidatorType.Array) {
            JsonValidatorUtils.internalGetAllKeys(schema.of, finalTypes, acc, `${prefix}[]`);
            return acc;
        }
        return acc;
    }
}
exports.JsonValidatorUtils = JsonValidatorUtils;
//# sourceMappingURL=JsonValidator.js.map