import { isString } from './utils/typechecks'
import { JsonValidatorTransformFunction } from './interfaces'

/**********************
 *
 * Transform functions
 *
 **********************/
export const JsonValidatorTransforms = {
  /**
   * Transform string to float number
   */
  toFloat: ((value: any): number => {
    if (isString(value)) {
      return parseFloat(value)
    }
    throw new Error(`Input of JsonValidatorTransforms.toFloat is not string`)
  }) as JsonValidatorTransformFunction<number>,
  /**
   * Transform string to integer number
   */
  toInteger: ((value: any): number => {
    if (isString(value)) {
      return parseInt(value, 10)
    }
    throw new Error(`Input of JsonValidatorTransforms.toInteger is not string`)
  }) as JsonValidatorTransformFunction<number>,
  /**
   * Transform string to Date
   */
  toDate: ((value: any): Date => {
    if (isString(value)) {
      return new Date(value)
    }
    throw new Error(`Input of JsonValidatorTransforms.toDate is not string`)
  }) as JsonValidatorTransformFunction<Date>,
}
