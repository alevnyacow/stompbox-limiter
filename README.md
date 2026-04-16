# Limiter

Framework-agnostic plug-n-play error library.

## Example

```ts
import { Limiter } from '@stompbox/limiter'

// MathError is a pre-configured class.
const MathError = Limiter({
    DIVIDED_BY_ZERO: 'MATH_01',
    SQUARE_ROOT_OF_NEGATIVE_NUMBER: 'MATH_02'
})

const divide = (a: number, b: number) => {
    if (!b) {
        // Define error details (can be `{}` if no details are needed)
        const errorDetails = { firstOperand: a.toString() }
        // Throw the instance of `MathError` with `DIVIDED_BY_ZERO` code
        throw new MathError('DIVIDED_BY_ZERO', errorDetails)
    }

    return a / b
}

const test = (a: number, b: number) => {
    try {
        console.log(divide(a, b))
    }
    catch (e: unknown) {
        // check if it's some math error
        if (MathError.isInstance(e)) {
            console.error('Some math error happened')
        }
        // or it's some specific math error
        if (MathError.isInstance(e, 'DIVIDED_BY_ZERO')) {
            console.error('Divided by zero!')
        }
    }
}
```