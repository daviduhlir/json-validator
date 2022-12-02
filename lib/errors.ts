import { AccumulatedError } from './interfaces'

/**********************
 *
 * Errors
 *
 **********************/
export class JsonValidationError extends Error {
  constructor(message: string) {
    super(message)
    const actualProto = new.target.prototype
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto)
    } else {
      ;(this as any).__proto__ = actualProto
    }
  }
}

export interface JsonValidatorFieldErrorDetail extends AccumulatedError {
  isOnKey?: boolean
  fieldDescription?: string
}

export class JsonValidationFieldError extends JsonValidationError {
  constructor(public readonly details: JsonValidatorFieldErrorDetail[]) {
    super('Field validation failed')
    const actualProto = new.target.prototype
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto)
    } else {
      ;(this as any).__proto__ = actualProto
    }
  }
}
