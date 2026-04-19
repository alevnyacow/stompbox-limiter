import {test, expect} from 'vitest'
import { isLimiterError, Limiter } from '.'

test('is Limiter error', () => {
    const defaultError = new Error()
    expect(isLimiterError(defaultError)).toBe(false)

    class TestLimiterError extends Limiter({ test1: 'LIMITER_TEST_1' }) {}

    const limiterError = new TestLimiterError('test1')
    expect(isLimiterError(limiterError)).toBe(true)
})