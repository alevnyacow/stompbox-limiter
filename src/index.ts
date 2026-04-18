type StringRecord = Record<string, string>;
type PlainPrimitivesObject = Record<string, string | number | boolean>;

type LimiterInstance<ErrorCodes extends StringRecord> = Error & {
  code: keyof ErrorCodes;
  details?: PlainPrimitivesObject;
};

type LimiterErrorStatic<ErrorCodes extends StringRecord> = {
  is(
    target: unknown,
    code?: keyof ErrorCodes
  ): target is LimiterInstance<ErrorCodes>;
};

type LimiterErrorClass<ErrorCodes extends StringRecord> =
  (new (
    code: keyof ErrorCodes,
    details?: PlainPrimitivesObject
  ) => LimiterInstance<ErrorCodes>)
  & LimiterErrorStatic<ErrorCodes>;

export const Limiter = <ErrorCodes extends StringRecord>(
  codes: ErrorCodes,
): LimiterErrorClass<ErrorCodes> => {
  return class Base extends Error {
    constructor(public readonly code: keyof ErrorCodes, public readonly details?: PlainPrimitivesObject) {
      super(details ? Object.entries(details).map(([key, value]) => `${key} - ${value}`).join(', ') : undefined);
      this.name = codes[code];
    }

    public static is = (target: unknown, code?: keyof ErrorCodes): target is LimiterInstance<ErrorCodes> => {
        if (!target || typeof target !== 'object') {
            return false;
        }
        if (!('code' in target)) {
            return false;
        }
        if (typeof target.code !== 'string') {
            return false;
        }
        if (!code) {
            return Object.keys(codes).includes(target.code)
        }
        return target.code === code
    }
  };
};

export const enrichDetails = {
  withSource: (source: string) => (details?: PlainPrimitivesObject): PlainPrimitivesObject => {
    if (!details) {
      return { source }
    }

    return { source, ...details }
  },
  withTimespamp: (details?: PlainPrimitivesObject): PlainPrimitivesObject => {
    const timestamp = Date.now()

    if (!details) {
      return { timestamp }
    }

    return { ...details, timestamp }
  }
}
