import {defaultMessages} from './default'
import {messages as nearOffwork} from './nearOffwork'
import {messages as night} from './night'
import {messages as offwork} from './offwork'
import {messages as working} from './working'

export const hoverDefaultMessages = defaultMessages

export const hoverMessagesByContext = {
  nearOffwork,
  night,
  offwork,
  working,
} as const
