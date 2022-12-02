import { AccumulatedError } from './interfaces';
export declare class JsonValidationError extends Error {
    constructor(message: string);
}
export interface JsonValidatorFieldErrorDetail extends AccumulatedError {
    isOnKey?: boolean;
    fieldDescription?: string;
}
export declare class JsonValidationFieldError extends JsonValidationError {
    readonly details: JsonValidatorFieldErrorDetail[];
    constructor(details: JsonValidatorFieldErrorDetail[]);
}
