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

export const isLimiterError = (x: unknown): x is LimiterInstance<{}> => {
  if (!(x instanceof Error)) {
    return false;
  }

  if (!('code' in x)) {
    return false
  }

  if (typeof x.code !== 'string') {
    return false
  }

  if (!('details' in x)) {
    return false
  }

  if (!x.details || typeof x.details !== 'object') {
    return false
  }

  return true
}

export const Limiter = <ErrorCodes extends StringRecord>(
  codes: ErrorCodes,
): LimiterErrorClass<ErrorCodes> => {
  return class Base extends Error {
    constructor(public readonly code: keyof ErrorCodes, public readonly details: PlainPrimitivesObject = {}) {
      super(details && Object.keys(details).length ? Object.entries(details).map(([key, value]) => `${key} - ${value}`).join(', ') : undefined);
      this.name = codes[code];
    }

    public static is = (target: unknown, code?: keyof ErrorCodes): target is LimiterInstance<ErrorCodes> => {
      if (!isLimiterError(target)) {
        return false
      }
      if (!code) {
          return Object.keys(codes).includes(target.code)
      }
      return target.code === code && target.name === codes[code]
    }
  };
};

export const enrichDetails = {
  withSource: (source?: string, strategy: 'skip empty source' | 'turn empty source to "unknown source"' = 'skip empty source') => (details?: PlainPrimitivesObject): PlainPrimitivesObject => {
    if (!source) {
      const sourcePart = strategy === 'skip empty source' ? {} : { source: 'unknown source' } as {}
      const detailsPart = details || {}
      return { ...sourcePart, ...detailsPart }
    } 
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
  },
  fromUnknownData: (source: unknown) => (details?: PlainPrimitivesObject): PlainPrimitivesObject => {
    let detailsPart = details || {}
    if (typeof source === 'number' || typeof source === 'string' || typeof source === 'boolean') {
      return { ...detailsPart, additionalInfo: source }
    }
    if (typeof source === 'object') {
      if (isLimiterError(source)) {
        return { ...detailsPart, ...source.details }
      }
      if (source instanceof Error) {
        return { ...detailsPart, errorMessage: source.message, errorName: source.name, errorStack: source.stack }
      }
      for (const sourceEntry of Object.entries(source)) {
        const [key, value] = sourceEntry
        if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
          detailsPart = { ...detailsPart, [key]: value }
        }
        if (typeof value === 'object' && value && !isLimiterError(value)) {
          detailsPart = { ...detailsPart, [key]: JSON.stringify(
            value instanceof Error 
              ? { name: value.name, message: value.message, stack: value.stack } 
              : value
            ) 
          }
        }
        if (isLimiterError(value)) {
          detailsPart = { ...detailsPart, ...value.details }
        }
      }
      return detailsPart
    }
  }
}