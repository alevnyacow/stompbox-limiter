type StringRecord = Record<string, string>;

export const Limiter = <
  ErrorCodes extends StringRecord
>(
  codes: ErrorCodes,
) => {
  class Base<Details extends StringRecord | undefined = undefined> {
    public readonly timestamp = Date.now()
    public readonly code: ErrorCodes[keyof ErrorCodes]

    public constructor(
        key: keyof ErrorCodes,
        public readonly details?: Details,
    ) {
        this.code = codes[key]
    }

    static checkInstance = (
      target: unknown,
      key?: keyof ErrorCodes,
    ): target is Base => {
      if (!target) {
        return false;
      }
      if (typeof target !== 'object') {
        return false;
      }

      if (!('code' in target)) {
        return false;
      }

      if (typeof target.code !== 'string') {
        return false;
      }

      const { code } = target;
      const errorCodes = Object.values(codes);
      if (!key) {
        return errorCodes.some((x) => x === code);
      }

      return codes[key] === code;
    };
  }

  return Base;
};
