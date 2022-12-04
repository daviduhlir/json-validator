import { expect } from 'chai'
import { JsonValidator, JsonValidatorType, JsonValidatorRequired } from '../dist'

describe('Basic validation', function() {
  it('Basic', async function() {
    const input = {
      skip: 0,
      limit: 10,
    }

    const result = JsonValidator.validate(input, {
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

    expect(result?.limit).to.equal(10)
    expect(result?.skip).to.equal(0)
  })

  it('Required', async function() {
    const input = {
      test: 123,
    }
    let error
    let result
    try {
      result = JsonValidator.validate(input, {
        type: JsonValidatorType.Object,
        childs: {
          test: {
              required: JsonValidatorRequired.True,
              type: JsonValidatorType.Number,
              min: 0,
          },
        },
      })
    } catch(e) {
      error = e
    }


    expect(error).to.equal(undefined)
    expect(result.test).to.equal(123)
  })
})
