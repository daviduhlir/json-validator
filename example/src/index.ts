import { JsonValidator, JsonValidatorRequired, JsonValidatorTransforms, JsonValidatorType } from '@david.uhlir/json-validator'

const input = {
  skip: 0,
  limit: 10,
}

let result
try {
  result = JsonValidator.validate(input, {
    type: JsonValidatorType.Object,
    childs: {
      skip: {
          required: JsonValidatorRequired.False,
          type: JsonValidatorType.Number,
          min: 0,
      },
      limit: {
          required: JsonValidatorRequired.False,
          type: JsonValidatorType.Number,
          min: 1,
          max: 50,
      },
    },
  })
} catch(e) {
  console.error('Validation error', e)
}

console.log(result)