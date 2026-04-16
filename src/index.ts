type StringRecord = Record<string, string>;

export const LimiterError = <
  ErrorCodes extends StringRecord,
  BaseDetails extends StringRecord = {},
>(
  codes: ErrorCodes,
) => {
  class BaseError {
    public constructor(
      public readonly code: ErrorCodes[keyof ErrorCodes],
      public readonly details: BaseDetails,
    ) {}

    static throw = <AdditionalDetails extends StringRecord = {}>(
      key: keyof ErrorCodes,
      details: BaseDetails & AdditionalDetails,
    ) => {
      throw new BaseError(codes[key], details);
    };

    static checkInstance = (
      target: unknown,
      key?: keyof ErrorCodes,
    ): target is BaseError => {
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

  return BaseError;
};
