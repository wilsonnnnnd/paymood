import * as happy from './happy'
import * as idle from './idle'
import * as excited from './excited'
import * as offwork from './offwork'
import * as sleepy from './sleepy'
import * as tired from './tired'
import * as working from './working'

export const moodMessages = {
  happy,
  idle,
  excited,
  offwork,
  sleepy,
  tired,
  working,
} as const
