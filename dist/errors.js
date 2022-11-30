"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValidationFieldError = exports.JsonValidationError = void 0;
class JsonValidationError extends Error {
    constructor(message) {
        super(message);
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            ;
            this.__proto__ = actualProto;
        }
    }
}
exports.JsonValidationError = JsonValidationError;
class JsonValidationFieldError extends JsonValidationError {
    constructor(details) {
        super('Field validation failed');
        this.details = details;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            ;
            this.__proto__ = actualProto;
        }
    }
}
exports.JsonValidationFieldError = JsonValidationFieldError;
//# sourceMappingURL=errors.js.map