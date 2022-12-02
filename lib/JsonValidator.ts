import { isString, isUndefined, isBoolean, isObject, isNumber, isArray, isRegExp, isDate, isFunction } from './utils/typechecks'
import { flatten, arrayDiff, findDuplicities } from './utils/array'
import {
  AccumulatedError,
  JsonObjectFromSchema,
  JsonValidatorAdditionalProperties,
  JsonValidatorAnySchema,
  JsonValidatorArraySchema,
  JsonValidatorBooleanSchema,
  JsonValidatorEnumSchema,
  JsonValidatorNumberSchema,
  JsonValidatorObjectChildsSchema,
  JsonValidatorObjectSchema,
  JsonValidatorPasswordSchema,
  JsonValidatorRequired,
  JsonValidatorSchema,
  JsonValidatorStringSchema,
  JsonValidatorType,
} from './interfaces'
import { JsonValidationError, JsonValidationFieldError } from './errors'

/**********************************************
 *
 * Quick functions
 *
 **********************************************/
export function required<T extends JsonValidatorSchema>(input: T): T {
  return {
    ...(input as any),
    required: JsonValidatorRequired.True,
  }
}

/**********************************************
 *
 * Validator class
 *
 **********************************************/
export class JsonValidator {
  /**
   * Helper for validate body by format object
   * Returns validated body or null
   * Throws:
   *  ValidatorError - for any problem with body data
   *  Error - for errors in format specification
   *
   * @param body
   * @param format
   */
  public static objectValidator<T extends JsonValidatorObjectChildsSchema>(
    input: any,
    schema: T,
    additinalProperties: JsonValidatorAdditionalProperties = JsonValidatorAdditionalProperties.Remove,
  ): JsonObjectFromSchema<T> {
    if (!input) {
      throw new JsonValidationError('Object is empty')
    }

    if (!isObject(input) || isArray(input)) {
      throw new JsonValidationError('Input is not object')
    }

    return JsonValidator.validate(input, {
      type: JsonValidatorType.Object,
      childs: schema,
      additinalProperties,
    })
  }

  /**
   * Validate key with name by schema
   * @param content
   * @param schema
   * @param parentKey
   * @param key
   */
  public static validate(content: any, schema: JsonValidatorSchema, parentKey: string = '', key: string = ''): any {
    const validators = {
      [JsonValidatorType.Any]: JsonValidator.validateAny,
      [JsonValidatorType.Boolean]: JsonValidator.validateBoolean,
      [JsonValidatorType.String]: JsonValidator.validateString,
      [JsonValidatorType.Password]: JsonValidator.validatePassword,
      [JsonValidatorType.Number]: JsonValidator.validateNumber,
      [JsonValidatorType.Enum]: JsonValidator.validateEnum,
      [JsonValidatorType.Array]: JsonValidator.validateArray,
      [JsonValidatorType.Object]: JsonValidator.validateObject,
    }
    if (validators[schema.type]) {
      if (content === null && schema.nullable) {
        return null
      }
      if (isFunction(schema.parseTransform)) {
        content = schema.parseTransform(content)
      }
      let output = validators[schema.type](parentKey, key, content, schema as any)
      if (isFunction(schema.outputTransform)) {
        output = schema.outputTransform(output)
      }
      return output
    }
    throw new Error(`Type ${schema.type} is not supported`)
  }

  /**
   * Any type validator
   * @param parentKey
   * @param key
   * @param content
   * @param schema
   */
  protected static validateAny(parentKey: string, key: string, content: any, schema: JsonValidatorAnySchema): any {
    return content
  }

  /**
   * Boolean type validator
   * @param parentKey
   * @param key
   * @param content
   * @param schema
   */
  protected static validateBoolean(parentKey: string, key: string, content: any, schema: JsonValidatorBooleanSchema): any {
    if (isBoolean(content)) {
      return content
    }
    throw new JsonValidationFieldError([
      {
        field: `${parentKey}${key}`,
        message: `Must be boolean`,
        humanKeyName: schema.humanKeyName,
        fieldDescription: schema.description,
      },
    ])
  }

  /**
   * String type validator
   * @param parentKey
   * @param key
   * @param content
   * @param schema
   */
  protected static validateString(parentKey: string, key: string, content: any, schema: JsonValidatorStringSchema): any {
    if (isString(content)) {
      // min length
      if (!isUndefined(schema.minLength)) {
        if (content.length < schema.minLength) {
          throw new JsonValidationFieldError([
            {
              field: `${parentKey}${key}`,
              message: `Minimal length is ${schema.minLength}`,
              humanKeyName: schema.humanKeyName,
              fieldDescription: schema.description,
            },
          ])
        }
      }
      // max length
      if (!isUndefined(schema.maxLength)) {
        if (content.length > schema.maxLength) {
          throw new JsonValidationFieldError([
            {
              field: `${parentKey}${key}`,
              message: `Maximal length is ${schema.maxLength}`,
              humanKeyName: schema.humanKeyName,
              fieldDescription: schema.description,
            },
          ])
        }
      }
      // regexp
      if (schema.regexp) {
        // prepare regexp and message
        let regExp: RegExp | null = null
        let message: string = `Doesn't match validation RegExp`
        if (isRegExp(schema.regexp)) {
          regExp = schema.regexp
        } else {
          regExp = schema.regexp.regexp
          message = schema.regexp.message
        }

        // test it
        if (regExp.test(content)) {
          // date parser
          if (schema.asDate) {
            const date = new Date(content)
            if (!isDate(date) || isNaN(date.getTime())) {
              throw new JsonValidationFieldError([
                {
                  field: `${parentKey}${key}`,
                  message: `Invalid date value`,
                  humanKeyName: schema.humanKeyName,
                  fieldDescription: schema.description,
                },
              ])
            }
            return date
          } else {
            return content
          }
        } else {
          // schema not matched
          throw new JsonValidationFieldError([
            {
              field: `${parentKey}${key}`,
              message,
              humanKeyName: schema.humanKeyName,
              fieldDescription: schema.description,
            },
          ])
        }
      } else {
        // equal match
        // date parser
        if (schema.asDate) {
          const date = new Date(content)
          if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new JsonValidationFieldError([
              {
                field: `${parentKey}${key}`,
                message: `Invalid date value`,
                humanKeyName: schema.humanKeyName,
                fieldDescription: schema.description,
              },
            ])
          }
          return date
        } else {
          return content
        }
      }
    }
    throw new JsonValidationFieldError([
      {
        field: `${parentKey}${key}`,
        message: `Must be string`,
        humanKeyName: schema.humanKeyName,
        fieldDescription: schema.description,
      },
    ])
  }

  /**
   * Password type validator
   * @param parentKey
   * @param key
   * @param content
   * @param schema
   */
  protected static validatePassword(parentKey: string, key: string, content: any, schema: JsonValidatorPasswordSchema): any {
    return JsonValidator.validateString(parentKey, key, content, schema)
  }

  /**
   * Number type validator
   * @param parentKey
   * @param key
   * @param content
   * @param schema
   */
  protected static validateNumber(parentKey: string, key: string, content: any, schema: JsonValidatorNumberSchema): any {
    if (isNumber(content) && !isNaN(content)) {
      // check min value
      if (!isUndefined(schema.min)) {
        if (content < schema.min) {
          throw new JsonValidationFieldError([
            {
              field: `${parentKey}${key}`,
              message: `Minimal value is ${schema.min}`,
              humanKeyName: schema.humanKeyName,
              fieldDescription: schema.description,
            },
          ])
        }
      }
      // check max value
      if (!isUndefined(schema.max)) {
        if (content > schema.max) {
          throw new JsonValidationFieldError([
            {
              field: `${parentKey}${key}`,
              message: `Maximal value is ${schema.max}`,
              humanKeyName: schema.humanKeyName,
              fieldDescription: schema.description,
            },
          ])
        }
      }
      if (schema.asInteger && !Number.isInteger(content)) {
        throw new JsonValidationFieldError([
          {
            field: `${parentKey}${key}`,
            message: `Must be integer, not float`,
            humanKeyName: schema.humanKeyName,
            fieldDescription: schema.description,
          },
        ])
      }
      return content
    }
    throw new JsonValidationFieldError([
      {
        field: `${parentKey}${key}`,
        message: `Must be number`,
        humanKeyName: schema.humanKeyName,
        fieldDescription: schema.description,
      },
    ])
  }

  /**
   * Enum type validator
   * @param parentKey
   * @param key
   * @param content
   * @param schema
   */
  protected static validateEnum(parentKey: string, key: string, content: any, schema: JsonValidatorEnumSchema): any {
    if (!isArray(schema.enum)) {
      throw new Error(`Missing 'enum' field in '${parentKey}${key}' format`)
    }
    if (isString(content) && schema.enum.indexOf(content) > -1) {
      return content
    }
    throw new JsonValidationFieldError([
      {
        field: `${parentKey}${key}`,
        message: `Must be one of following values [${schema.enum}]`,
        humanKeyName: schema.humanKeyName,
        fieldDescription: schema.description,
      },
    ])
  }

  /**
   * Array type validator
   * @param parentKey
   * @param key
   * @param content
   * @param schema
   * @param keyName
   */
  protected static validateArray(parentKey: string, key: string, content: any, schema: JsonValidatorArraySchema): any {
    if (!schema.of) {
      throw new Error(`Missing 'of' field in '${parentKey}${key}' format`)
    }
    if (isArray(content)) {
      // min length
      if (!isUndefined(schema.minLength)) {
        if (content.length < schema.minLength) {
          throw new JsonValidationFieldError([
            {
              field: `${parentKey}${key}`,
              message: `Must have minimal length of ${schema.minLength} items`,
              humanKeyName: schema.humanKeyName,
              fieldDescription: schema.description,
            },
          ])
        }
      }
      // max length
      if (!isUndefined(schema.maxLength)) {
        if (content.length > schema.maxLength) {
          throw new JsonValidationFieldError([
            {
              field: `${parentKey}${key}`,
              message: `Must have maximal length of ${schema.maxLength} items`,
              humanKeyName: schema.humanKeyName,
              fieldDescription: schema.description,
            },
          ])
        }
      }

      // validate items
      const acumulatedErrors: AccumulatedError[] = []

      // find duplicities
      if (isString(schema.unique)) {
        findDuplicities(content, schema.unique).forEach(index => {
          acumulatedErrors.push({
            field: `${parentKey}${key}[${index}]${schema.unique ? '.' + schema.unique : schema.unique}`,
            message: `Items must be unique`,
            humanKeyName: schema.humanKeyName,
          })
        })
      }

      // accumulate errors
      content.forEach((item, index) => {
        try {
          JsonValidator.validate(item, schema.of, `${parentKey}${key}`, `[${index}]`)
        } catch (e) {
          if (e instanceof JsonValidationFieldError) {
            acumulatedErrors.push(...e.details)
          } else {
            throw e
          }
        }
      })

      // throw accumulated errors for all items
      if (acumulatedErrors.length) {
        throw new JsonValidationFieldError(flatten(acumulatedErrors))
      }
      return content
    }
    throw new JsonValidationFieldError([
      {
        field: `${parentKey}${key}`,
        message: `Must be array`,
        humanKeyName: schema.humanKeyName,
        fieldDescription: schema.description,
      },
    ])
  }

  /**
   * Object type validator
   * @param parentKey
   * @param key
   * @param content
   * @param schema
   */
  protected static validateObject(parentKey: string, key: string, content: any, schema: JsonValidatorObjectSchema) {
    if ((!schema.childs || !isObject(schema.childs)) && !schema.of) {
      throw new Error(`Missing 'childs' or 'of' field in '${parentKey}${key}' format`)
    }
    if (isObject(content) && !isArray(content)) {
      const objKeys = schema.childs ? Object.keys(schema.childs) : Object.keys(content)
      const outObject = {}

      // for each property
      const acumulatedErrors: AccumulatedError[] = []

      objKeys.forEach(objKey => {
        try {
          let newParentKey = `${parentKey}${key}.`
          if (newParentKey === '.') {
            newParentKey = ''
          }

          // test regexp for property name
          if (schema.keysRegexp) {
            let regExp: RegExp | null = null
            let message: string = `Doesn't match validation RegExp`
            if (schema.keysRegexp instanceof RegExp) {
              regExp = schema.keysRegexp
            } else {
              regExp = schema.keysRegexp.regexp
              message = schema.keysRegexp.message
            }

            if (!regExp.test(objKey)) {
              throw new JsonValidationFieldError([
                {
                  field: `${parentKey}${key}.${objKey}`,
                  isOnKey: true,
                  message,
                  fieldDescription: schema.description,
                },
              ])
            }
          }

          // validate content of property
          if (!isUndefined(content[objKey])) {
            outObject[objKey] = JsonValidator.validate(content[objKey], schema.childs ? schema.childs[objKey] : schema.of, newParentKey, objKey)
          } else if (schema.childs && schema.childs[objKey].required === JsonValidatorRequired.True) {
            // was undefined, and is required
            throw new JsonValidationFieldError([
              {
                field: `${newParentKey}${objKey}`,
                message: `Missing required field`,
                humanKeyName: schema.humanKeyName,
                fieldDescription: schema.description,
              },
            ])
          }
        } catch (e) {
          if (e instanceof JsonValidationFieldError) {
            acumulatedErrors.push(...e.details)
          } else {
            throw e
          }
        }
      })

      // throw accumulated errors for all properties
      if (acumulatedErrors.length) {
        throw new JsonValidationFieldError(flatten(acumulatedErrors))
      }

      const additinalProperties = schema.additinalProperties ? schema.additinalProperties : JsonValidatorAdditionalProperties.Remove

      // throw additional error
      // only for reject - most strict mode
      if (additinalProperties === JsonValidatorAdditionalProperties.Reject) {
        const keysContent = Object.keys(content)
        const keysOut = Object.keys(outObject)
        if (keysContent.length > keysOut.length) {
          const diff = arrayDiff(keysContent, keysOut)
          throw new JsonValidationFieldError(
            diff.map((additionalKey: string) => ({
              field: `${parentKey}${key}.${additionalKey}`,
              message: `Additional keys is not allowed`,
              humanKeyName: schema.humanKeyName,
              fieldDescription: schema.description,
            })),
          )
        }
      }

      return {
        ...outObject,
      }
    }

    throw new JsonValidationFieldError([
      {
        field: `${parentKey}${key}`,
        message: `Must be object`,
        humanKeyName: schema.humanKeyName,
        fieldDescription: schema.description,
      },
    ])
  }
}

/**********************
 *
 * Json validator utils
 *
 **********************/
export class JsonValidatorUtils {
  /**
   * Get all posible keys until finalType is reached in every branches of schema.
   * @param schema
   * @param finalTypes
   * @returns
   */
  public static getAllKeys(
    schema: JsonValidatorSchema,
    finalTypes: JsonValidatorType[] = [
      JsonValidatorType.Any,
      JsonValidatorType.Boolean,
      JsonValidatorType.Number,
      JsonValidatorType.String,
      JsonValidatorType.Enum,
    ],
  ): { [key: string]: JsonValidatorSchema } {
    return JsonValidatorUtils.internalGetAllKeys(schema, finalTypes)
  }

  /**
   * Internal recursion to get all keys from schema
   * @param schema
   * @param finalTypes
   * @param acc
   * @param prefix
   * @returns
   */
  protected static internalGetAllKeys(
    schema: JsonValidatorSchema,
    finalTypes: JsonValidatorType[],
    acc: { [key: string]: JsonValidatorSchema } = {},
    prefix: string = '',
  ): { [key: string]: JsonValidatorSchema } {
    if (finalTypes.includes(schema.type)) {
      acc[prefix] = schema
      return acc
    } else if (schema.type === JsonValidatorType.Object) {
      const keys = Object.keys(schema.childs)
      keys.forEach(key =>
        JsonValidatorUtils.internalGetAllKeys(
          schema.childs[key],
          finalTypes,
          acc,
          `${prefix ? prefix + '.' : ''}${schema.childs[key].required !== JsonValidatorRequired.True ? '?' : ''}${key}`,
        ),
      )
      return acc
    } else if (schema.type === JsonValidatorType.Array) {
      JsonValidatorUtils.internalGetAllKeys(schema.of, finalTypes, acc, `${prefix}[]`)
      return acc
    }
    return acc
  }
}
