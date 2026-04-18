import z, { ZodError } from 'zod'

export const zodErrorDetails = (error: ZodError): Record<string, string> => {
    const { fieldErrors, formErrors }  = z.flattenError<any, string>(error, x => {
        const path = x.path.length > 1 ? ` at ${x.path.slice(1).join('.')}` : ''
        return `${x.message}${path}`
    })

    const fields = Object.fromEntries(Object.entries(fieldErrors).map(([key, errors]) => [key, errors!.join(', ')]))
    const general = formErrors.length ? { generalErrors: formErrors.join(', ') } : {} as ({ generalErrors: string[] } | {})

    return { ...general, ...fields }
}