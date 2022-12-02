/**********************
 *
 * Error data
 *
 **********************/
export interface AccumulatedError {
  field: string
  message: string
  humanKeyName?: string
}

/**********************
 *
 * Data types
 *
 **********************/
export enum JsonValidatorType {
  Any = 'Any',
  Boolean = 'Boolean',
  Number = 'Number',
  String = 'String',
  Password = 'Password',
  Enum = 'Enum',
  Array = 'Array',
  Object = 'Object',
}

export interface TypeOfJsonValidatorType<OF = any> {
  [JsonValidatorType.Any]: any
  [JsonValidatorType.String]: string
  [JsonValidatorType.Password]: string
  [JsonValidatorType.Array]: OF[]
  [JsonValidatorType.Boolean]: boolean
  [JsonValidatorType.Enum]: string
  [JsonValidatorType.Number]: number
  [JsonValidatorType.Object]: { [key: string]: any }
}

export type JsonValidatorTransformFunction<T> = (value: any) => T

export enum JsonValidatorRequired {
  True = 'True',
  False = 'False',
}

/**********************
 *
 * Common schemas
 *
 **********************/
export interface JsonValidatorCommonSchema<T> {
  /**
   * Type of validated key
   */
  type: T

  /**
   * Is required (default: JsonValidatorRequired.False)
   */
  required?: Readonly<JsonValidatorRequired>

  /**
   * Can be null
   */
  nullable?: boolean

  /**
   * Human readable key name
   */
  humanKeyName?: string

  /**
   * Transform input data (before validation)
   */
  parseTransform?: JsonValidatorTransformFunction<any>

  /**
   * Transform output data (after validation)
   */
  outputTransform?: JsonValidatorTransformFunction<any>

  /**
   * Some description of field
   */
  description?: string
}

export interface JsonValidatorClampLengthSchema {
  /**
   * Minimal length of String or Array lenght
   */
  minLength?: number
  /**
   * Maximal length of String or Array lenght
   */
  maxLength?: number
}

export interface JsonValidatorCollectionSchema {
  /**
   * Type of Array childs (valid only for Array or Object)
   */
  of?: JsonValidatorSchema
}

export type JsonRegExpValidation = RegExp | { regexp: RegExp; message: string }
export type JsonValidatorObjectChildsSchema = { [key: string]: JsonValidatorSchema }
export const JsonValidatorArrayUnique = ''

/**********************
 *
 * Type schemas
 *
 **********************/
// boolean
export interface JsonValidatorAnySchema extends JsonValidatorCommonSchema<JsonValidatorType.Any> {}

// boolean
export interface JsonValidatorBooleanSchema extends JsonValidatorCommonSchema<JsonValidatorType.Boolean> {}

// string
export interface JsonValidatorStringSchema extends JsonValidatorCommonSchema<JsonValidatorType.String>, JsonValidatorClampLengthSchema {
  /**
   * RegExp for validate string (valid only for String)
   */
  regexp?: JsonRegExpValidation

  /**
   * Try parse as new Date() (valid only for String)
   */
  asDate?: boolean
}

// password
export interface JsonValidatorPasswordSchema extends JsonValidatorCommonSchema<JsonValidatorType.String>, JsonValidatorClampLengthSchema {
  /**
   * RegExp for validate string (valid only for String)
   */
  regexp?: JsonRegExpValidation

  /**
   * Try parse as new Date() (valid only for String)
   */
  asDate?: boolean
}

// number
export interface JsonValidatorNumberSchema extends JsonValidatorCommonSchema<JsonValidatorType.Number> {
  /**
   * Minimal value of Number
   */
  min?: number
  /**
   * Maximal value of Number
   */
  max?: number

  /**
   * Is integer needed (valid only for Number)
   */
  asInteger?: boolean
}

// enum
export interface JsonValidatorEnumSchema extends JsonValidatorCommonSchema<JsonValidatorType.Enum> {
  /**
   * Possible Enum values (valid only for Enum)
   */
  enum?: string[] | Readonly<string[]>
}

// array
export interface JsonValidatorArraySchema
  extends JsonValidatorCommonSchema<JsonValidatorType.Array>,
    JsonValidatorClampLengthSchema,
    JsonValidatorCollectionSchema {
  unique?: string
}

export enum JsonValidatorAdditionalProperties {
  Reject = 'Reject',
  Remove = 'Remove',
}

// object
export interface JsonValidatorObjectSchema extends JsonValidatorCommonSchema<JsonValidatorType.Object>, JsonValidatorCollectionSchema {
  /**
   * Type of Object childs (valid only for Object)
   */
  childs?: JsonValidatorObjectChildsSchema

  /**
   * RegExp for childs keys (valid only for Object)
   */
  keysRegexp?: JsonRegExpValidation

  /**
   * Can contains any other properties?
   *
   * Allow - allow additional properties in output
   * Reject - object with additional props is not valid
   * Remove - remove additional properties but keep object valid
   */
  additinalProperties?: JsonValidatorAdditionalProperties
}

export type JsonValidatorSchema =
  | JsonValidatorAnySchema
  | JsonValidatorBooleanSchema
  | JsonValidatorStringSchema
  | JsonValidatorNumberSchema
  | JsonValidatorEnumSchema
  | JsonValidatorArraySchema
  | JsonValidatorObjectSchema

export type GetOf<T extends JsonValidatorArraySchema> = T['of']
export type GetOfType<T extends JsonValidatorArraySchema> = T['of']['type']
export type GetChilds<T extends JsonValidatorObjectSchema> = T['childs']
export type GetEnum<T extends JsonValidatorEnumSchema> = T['enum']

export type ConvertObject<T extends JsonValidatorSchema> = T extends JsonValidatorObjectSchema
  ? GetChilds<T> extends object
    ? JsonObjectFromSchema<GetChilds<T>>
    : TypeOfJsonValidatorType[T['type']]
  : TypeOfJsonValidatorType[T['type']]
export type ConvertFunction<T extends JsonValidatorSchema> = T['outputTransform'] extends JsonValidatorTransformFunction<any>
  ? ReturnType<T['outputTransform']>
  : never
export type ConvertEnum<T extends JsonValidatorSchema> = T extends JsonValidatorEnumSchema
  ? GetEnum<T> extends Readonly<string[]>
    ? GetEnum<T>[number]
    : TypeOfJsonValidatorType[T['type']]
  : TypeOfJsonValidatorType[T['type']]

export type ConvertComplete<T extends JsonValidatorSchema> = T['outputTransform'] extends JsonValidatorTransformFunction<any>
  ? ReturnType<T['outputTransform']>
  : T extends JsonValidatorArraySchema
  ? GetOf<T> extends object
    ? GetOf<T> extends JsonValidatorObjectSchema
      ? TypeOfJsonValidatorType<ConvertObject<GetOf<T>>>[T['type']]
      : TypeOfJsonValidatorType<TypeOfJsonValidatorType[GetOfType<T>]>[T['type']]
    : TypeOfJsonValidatorType[T['type']]
  : T extends JsonValidatorObjectSchema
  ? ConvertObject<T>
  : T extends JsonValidatorEnumSchema
  ? ConvertEnum<T>
  : TypeOfJsonValidatorType[T['type']]

export type OnlyRequiredKeys<T extends JsonValidatorObjectChildsSchema> = {
  [K in keyof T]: T[K]['required'] extends JsonValidatorRequired.True ? K : never
}[keyof T]

export type OnlyOptionalKey<T extends JsonValidatorObjectChildsSchema> = {
  [K in keyof T]?: T[K]['required'] extends JsonValidatorRequired.True ? never : K
}[keyof T]

export type RequiredChilds<T extends JsonValidatorObjectChildsSchema> = {
  [K in keyof T]: ConvertComplete<T[K]>
}

export type OptionalChilds<T extends JsonValidatorObjectChildsSchema> = {
  [K in keyof T]?: ConvertComplete<T[K]>
}

// output type
export type JsonObjectFromSchema<T extends JsonValidatorObjectChildsSchema> = RequiredChilds<Pick<T, OnlyRequiredKeys<T>>> &
  OptionalChilds<Pick<T, OnlyOptionalKey<T>>>
