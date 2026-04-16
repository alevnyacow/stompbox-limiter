type StringRecord = Record<string, string>;

type LimiterErrorClass<ErrorCodes extends StringRecord> = new (
  key: keyof ErrorCodes,
  details?: StringRecord
) => Error & {
  checkKey(code: keyof ErrorCodes): boolean;
};

export const Limiter = <ErrorCodes extends StringRecord>(
  codes: ErrorCodes,
): LimiterErrorClass<ErrorCodes> => {
  return class Base extends Error {
    constructor(private readonly key: keyof ErrorCodes, details?: StringRecord) {
      super(details ? JSON.stringify(details) : undefined);
      this.name = codes[key];
    }

    public checkKey = (code: keyof ErrorCodes) => {
      return this.key === code;
    };
  };
};