import createMessageObjectSchema from './create-message-object'
import * as HttpStatusPhrases from './http-status-phrases'

export const notFoundSchema = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND)

export const unauthorizedSchema = createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED)

export const tooManyRequestsSchema = createMessageObjectSchema(HttpStatusPhrases.TOO_MANY_REQUESTS)
