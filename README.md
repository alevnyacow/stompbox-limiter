# Limiter

Framework-agnostic plug-n-play error library.

## Example

```ts
import { Limiter } from '@stompbox/limiter'

const MathError = Limiter({
    DIVIDED_BY_ZERO: 'MATH_01',
    SQUARE_ROOT_OF_NEGATIVE_NUMBER: 'MATH_02'
})

const divide = (a: number, b: number) => {
    if (!b) {
        throw new MathError('DIVIDED_BY_ZERO')
    }

    return a / b
}

const test = (a: number, b: number) => {
    try {
        console.log(divide(a, b))
    }
    catch (e: unknown) {
        if (e instanceof MathError) {
            if (e.checkKey('DIVIDED_BY_ZERO')) {
                console.error('Divided by zero!')
            }
        }
    }
}
```