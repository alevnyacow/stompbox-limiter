# Limiter

Framework-agnostic plug-and-play custom errors.

## Example

```ts
import { Limiter } from '@stompbox/limiter'

class MathError extends Limiter({
    DIVIDED_BY_ZERO: 'MATH_01',
    SQUARE_ROOT_OF_NEGATIVE: 'MATH_02'
}) {}

const divide = (a: number, b: number) => {
    if (!b) {
        // strictly-typed, with autocomplete
        throw new MathError('DIVIDED_BY_ZERO')
    }

    return a / b
}

const sqrt = (num: number) => {
    if (num < 0) {
        throw new MathError(
            'SQUARE_ROOT_OF_NEGATIVE',
            // details
            { num }
        )
    }

    return Math.sqrt(num)
}

const test = (a: number, b: number) => {
    try {
        console.log("Divide: " + divide(a, b))
        console.log("First sqrt: " + sqrt(a))
        console.log("Second sqrt: " + sqrt(b))
    }
    catch (e: unknown) {
        // also strictly-typed, with autocomplete
        if (MathError.is(e, 'DIVIDED_BY_ZERO')) {
            console.error('Divided by zero!')
        }
        if (MathError.is(e, 'SQUARE_ROOT_OF_NEGATIVE')) {
            console.error('Square root of negative!')
            console.error(e.details)
        }
        console.error(e)
    }
}
```