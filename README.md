# Limiter

Framework-agnostic plug-n-play error library.

## Example

```ts
import { Limiter } from '@stompbox/limiter'

const MathError = Limiter({
    DIVIDED_BY_ZERO: 'MATH_01',
    SQUARE_ROOT_OF_NEGATIVE: 'MATH_02'
})

const divide = (a: number, b: number) => {
    if (!b) {
        // error code is strictly typed
        throw new MathError('DIVIDED_BY_ZERO')
    }

    return a / b
}

const sqrt = (a: number) => {
    if (a < 0) {
        throw new MathError(
            'SQUARE_ROOT_OF_NEGATIVE',
            // any details can be provided
            // in format of Record<string, string>
            { num: a.toString() }
        )
    }

    return Math.sqrt(a)
}

const test = (a: number, b: number) => {
    try {
        console.log("Divide: " + divide(a, b))
        console.log("First sqrt: " + sqrt(a))
        console.log("Second sqrt: " + sqrt(b))
    }
    catch (e: unknown) {
        if (e instanceof MathError) {
            if (e.checkKey('DIVIDED_BY_ZERO')) {
                console.error('Divided by zero!')
            }
            if (e.checkKey('SQUARE_ROOT_OF_NEGATIVE')) {
                console.error('Square root of negative!')
            }
        }
        console.error(e)
    }
}
```