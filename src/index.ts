export const LimiterError = <ErrorCodes extends Record<string, string>>(codes: ErrorCodes) => {
    class BaseError {
        public constructor(
            public readonly code: ErrorCodes[keyof ErrorCodes],
            public readonly details?: any,
        ) {}

        static throw = (key: keyof ErrorCodes, details?: any) => {
            throw new BaseError(codes[key], details)
        }

        static checkInstance = (target: unknown, key?: keyof ErrorCodes): target is BaseError => {
            if (!target) {
                return false
            }
            if (typeof target !== 'object') {
                return false
            }
            
            if (!('code' in target)) {
                return false
            }

            if (typeof target.code !== 'string') {
                return false
            }

            const { code } = target
            const errorCodes = Object.values(codes)
            if (!key) {
                return errorCodes.some(x => x === code)
            }

            return codes[key] === code
        }
    }

    return BaseError;
}
