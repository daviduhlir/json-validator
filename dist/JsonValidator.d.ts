import { JsonObjectFromSchema, JsonValidatorAdditionalProperties, JsonValidatorAnySchema, JsonValidatorArraySchema, JsonValidatorBooleanSchema, JsonValidatorEnumSchema, JsonValidatorNumberSchema, JsonValidatorObjectChildsSchema, JsonValidatorObjectSchema, JsonValidatorPasswordSchema, JsonValidatorRequired, JsonValidatorSchema, JsonValidatorStringSchema, JsonValidatorType } from './interfaces';
export declare function required<T extends JsonValidatorSchema, K extends {
    required: JsonValidatorRequired.True;
}>(input: T): T & K;
export declare class JsonValidator {
    static objectValidator<T extends JsonValidatorObjectChildsSchema>(input: any, schema: T, additinalProperties?: JsonValidatorAdditionalProperties): JsonObjectFromSchema<T>;
    static validate(content: any, schema: JsonValidatorSchema, parentKey?: string, key?: string): any;
    protected static validateAny(parentKey: string, key: string, content: any, schema: JsonValidatorAnySchema): any;
    protected static validateBoolean(parentKey: string, key: string, content: any, schema: JsonValidatorBooleanSchema): any;
    protected static validateString(parentKey: string, key: string, content: any, schema: JsonValidatorStringSchema): any;
    protected static validatePassword(parentKey: string, key: string, content: any, schema: JsonValidatorPasswordSchema): any;
    protected static validateNumber(parentKey: string, key: string, content: any, schema: JsonValidatorNumberSchema): any;
    protected static validateEnum(parentKey: string, key: string, content: any, schema: JsonValidatorEnumSchema): any;
    protected static validateArray(parentKey: string, key: string, content: any, schema: JsonValidatorArraySchema): any;
    protected static validateObject(parentKey: string, key: string, content: any, schema: JsonValidatorObjectSchema): {};
}
export declare class JsonValidatorUtils {
    static getAllKeys(schema: JsonValidatorSchema, finalTypes?: JsonValidatorType[]): {
        [key: string]: JsonValidatorSchema;
    };
    protected static internalGetAllKeys(schema: JsonValidatorSchema, finalTypes: JsonValidatorType[], acc?: {
        [key: string]: JsonValidatorSchema;
    }, prefix?: string): {
        [key: string]: JsonValidatorSchema;
    };
}
