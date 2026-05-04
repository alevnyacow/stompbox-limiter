type StringRecord = Record<string, string>;
type PlainPrimitivesObject = Record<string, string | number | boolean>;

export type LimiterError<ErrorCodes extends StringRecord = {}> = 
  {} extends ErrorCodes 
  ? LimiterErrorWithUnknownCodes 
  : LimiterErrorWithStrictCodes<ErrorCodes>

type LimiterErrorWithUnknownCodes = Error & {
  code: string;
  details: PlainPrimitivesObject
}

type LimiterErrorWithStrictCodes<ErrorCodes extends StringRecord> = Error & {
  code: keyof ErrorCodes;
  details: PlainPrimitivesObject;
};

type LimiterErrorStatic<ErrorCodes extends StringRecord> = {
  is(
    target: unknown,
    code?: keyof ErrorCodes
  ): target is LimiterError<ErrorCodes>;
};

type LimiterErrorClass<ErrorCodes extends StringRecord> =
  (new (
    code: keyof ErrorCodes,
    details?: PlainPrimitivesObject
  ) => LimiterErrorWithStrictCodes<ErrorCodes>)
  & LimiterErrorStatic<ErrorCodes>;

export const isLimiterError = (x: unknown): x is LimiterErrorWithUnknownCodes => {
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

    public static is = (target: unknown, code?: keyof ErrorCodes): target is LimiterError<ErrorCodes> => {
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
  withResponseStatusCode: (responseStatusCode: number) => (options?: PlainPrimitivesObject): PlainPrimitivesObject => {
    return {
      ...(options || {}),
      responseStatusCode
    }
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
    if (typeof source === 'object' && source) {
      if (isLimiterError(source)) {
        return { ...detailsPart, ...source.details }
      }
      if (source instanceof Error) {
        if (source.stack) {
          return { ...detailsPart, errorMessage: source.message, errorName: source.name, errorStack: source.stack }
        }
        return { ...detailsPart, errorMessage: source.message, errorName: source.name }
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
    }
    return detailsPart
  }
}

export const commonDetails = (data: unknown): { responseStatusCode?: number, source?: string } => {
  if (!isLimiterError(data)) {
    return {}
  }

  const responseStatusCode = data.details.responseStatusCode
  const source = data.details.source

  return {
    responseStatusCode: typeof responseStatusCode === 'number' ? responseStatusCode : undefined,
    source: typeof source === 'string' ? source : undefined
  }
}