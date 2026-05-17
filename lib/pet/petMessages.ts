import type {PetMood, PetMoodInput} from './petMoodRules'

export type PetMessageContext = 'default' | 'morning' | 'night' | 'nearOffwork' | 'weekend'
export type HoverMessageContext = 'default' | 'working' | 'nearOffwork' | 'offwork' | 'night'

function clamp(v: number, min: number, max: number) {
  if (!isFinite(v)) return min
  return Math.min(max, Math.max(min, v))
}

function isLateNight(d: Date) {
  const h = d.getHours()
  const m = d.getMinutes()
  if (h < 6) return true
  if (h > 21) return true
  return h === 21 && m >= 30
}

function isMorning(d: Date) {
  const h = d.getHours()
  return h >= 6 && h < 10
}

export const petMessages: Record<PetMood, readonly string[]> = {
  idle: [
    '我在这儿，慢慢来。',
    '先把手头这一点点做好。',
    '别急，呼吸一下。',
    '今天也可以从小步开始。',
    '先做最小的那件事。',
    '把心放回正中间。',
    '不用冲，稳一点。',
    '别把自己催坏。',
    '先把桌面收拾一下也行。',
    '我们慢慢拉回节奏。',
    '你可以先发呆十秒。',
    '先把“开始”按下去。',
    '先处理一个小卡点。',
    '别追着时间跑。',
    '没关系，先开个头。',
    '今天也算数。',
    '你在努力了。',
    '给自己一点空间。',
    '先把脑子放松一下。',
    '我在旁边，不吵。',
    '先把第一步走出去。',
    '不用完美，能动就行。',
    '别急着证明什么。',
    '就当在热身。',
    '先从最简单的开始。',
    '今天的路，我们慢慢走。',
    '别忘了喝水。',
    '先把呼吸找回来。',
    '慢一点也很体面。',
    '现在这样就很好。',
  ],
  working: [
    '我陪你上班。',
    '专注一会儿，就一会儿。',
    '慢慢推进，不用冲刺。',
    '在做了，在做了。',
    '先把这一块收好。',
    '手别停，脑子也别急。',
    '把注意力交给下一步。',
    '别急着把所有事一次做完。',
    '先把难点切小一点。',
    '今天就按计划走。',
    '我帮你盯着节奏。',
    '把手机放远一点点。',
    '先把这个窗口关掉。',
    '这段路挺长，慢慢走。',
    '把手头的噪音关小。',
    '你已经在推进了。',
    '先把邮件晚点回。',
    '先做“能马上完成”的。',
    '别被消息带走。',
    '把注意力拉回来。',
    '不需要快，持续就行。',
    '做完这一小段就歇一下。',
    '你不需要一直满格。',
    '先把最重要的那件事搞定。',
    '有些事可以明天再说。',
    '别硬撑，换个角度。',
    '慢一点，错得更少。',
    '继续，别怕。',
    '你做得很稳。',
    '今天够清醒了。',
  ],
  tired: [
    '感觉有点拖…先松一下肩。',
    '累了也没关系，先稳住节奏。',
    '要不要喝口水再继续？',
    '别硬扛，换个小任务。',
    '先把眼睛移开屏幕。',
    '我们先做个轻量的。',
    '先把呼吸放慢。',
    '别跟自己较劲。',
    '今天的电量有点低。',
    '先把“下一步”写出来。',
    '别急着逼自己有产出。',
    '先把桌面整理一下。',
    '做不动就先停两分钟。',
    '先把最吵的那件事放下。',
    '这会儿不适合硬冲。',
    '换个简单的收尾。',
    '把肩颈放松一下。',
    '先把光线调暖一点。',
    '你已经扛很久了。',
    '别把疲惫当成失败。',
    '要不要站起来走两步。',
    '我给你守着位置。',
    '慢一点也算在走。',
    '这会儿先保命。',
    '别把自己耗光。',
    '不想做就先不做。',
    '先把脑子歇一下。',
    '你不需要一直赢。',
    '先把音量关小。',
    '我在，别怕。',
  ],
  sleepy: [
    '有点晚了，别把自己熬坏。',
    '收个尾就好，剩下明天。',
    '眼睛先休息一下。',
    '慢一点，也算进度。',
    '今天就到这儿吧。',
    '别在深夜和需求打架。',
    '这会儿容易多想。',
    '先把灯调暗一点。',
    '把手从键盘上拿开一下。',
    '明天的你会谢谢现在的你。',
    '不需要在凌晨证明自己。',
    '先保存，然后收工。',
    '别让夜晚把你吞掉。',
    '先把电脑合上。',
    '你已经做很多了。',
    '把心放松一点。',
    '要不要去喝点温水。',
    '先把眼睛闭十秒。',
    '今晚就先这样。',
    '别再加新任务了。',
    '先把明天的第一步写下来。',
    '别再刷新消息了。',
    '这会儿适合放过自己。',
    '先去洗把脸。',
    '你不是机器。',
    '我陪你把最后一行收好。',
    '别把焦虑带上床。',
    '今夜先结束吧。',
    '明天也会继续。',
    '睡意来了就别硬撑。',
  ],
  happy: [
    '快下班了吗？',
    '快到啦，我看见了。',
    '再一点点，就可以松口气。',
    '这段推进得挺顺。',
    '今天的节奏不错。',
    '剩下的不多了。',
    '我们把尾巴收干净。',
    '别急，稳稳地收工。',
    '你这会儿很在线。',
    '再推进一小段就好。',
    '今天比想象中顺。',
    '别忘了给自己留点余地。',
    '你已经把难的扛过去了。',
    '把最后几个点钉住。',
    '快到终点了。',
    '这会儿可以稍微开心。',
    '我看着你一点点完成。',
    '别被小细节绊住。',
    '把收尾做漂亮。',
    '你做得挺好。',
    '差不多了。',
    '收工的味道出来了。',
    '今天可以早点放过自己。',
    '最后一杯咖啡别再续了。',
    '别临时加戏。',
    '保持现在的节奏。',
    '就按这个速度。',
    '你马上就自由了。',
    '我们把这页翻过去。',
    '今天挺值。',
  ],
  excited: [
    '最后一小段，冲一下就收工。',
    '已经很接近了。',
    '再两步，真的。',
    '我在旁边给你打气，但不吵。',
    '最后的收尾别乱。',
    '把最后的线收紧。',
    '别在终点摔一跤。',
    '就差一点点。',
    '这会儿别开新坑。',
    '把“完成”写上去。',
    '你已经到门口了。',
    '最后一口气。',
    '很快就能关电脑。',
    '别让细节拖住你。',
    '别紧张，稳。',
    '就按计划结束。',
    '这段冲刺很漂亮。',
    '你离下班很近了。',
    '把最后的确认做掉。',
    '我们一起把它结束。',
    '现在别犹豫。',
    '把按钮点下去就好。',
    '你会赢。',
    '最后的 5%。',
    '我看着你收工。',
    '别回头了。',
    '继续。',
    '快了。',
    '再一下。',
    '收。',
  ],
  offwork: [
    '今天也在努力摸鱼吗？',
    '下班时间，先把你还给你自己。',
    '今天就到这儿吧。',
    '休息一下也没关系。',
    '你已经够努力了。',
    '别再打开邮箱了。',
    '把工作留在今天。',
    '去吃点像样的。',
    '今晚不加班。',
    '你的时间回来了。',
    '把电脑合上。',
    '别再想 KPI 了。',
    '先把身体放松。',
    '今天的事，明天再说。',
    '走，去喘口气。',
    '别跟自己讨价还价。',
    '今天也算完成。',
    '你不是为工作而活。',
    '先去喝水。',
    '把手机放下也可以。',
    '让大脑下班。',
    '去散个步。',
    '关掉通知。',
    '把疲惫放回椅子上。',
    '今天到此为止。',
    '你可以不用再努力。',
    '把夜晚留给自己。',
    '今晚不追进度。',
    '放过自己一下。',
    '回家。',
  ],
}

export function pickPetMessage(mood: PetMood, seed: number) {
  const list = petMessages[mood] ?? []
  if (list.length === 0) return ''
  const safeSeed = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0
  return list[safeSeed % list.length] ?? list[0] ?? ''
}

export function getPetMessageContext(input: PetMoodInput, mood: PetMood): PetMessageContext {
  const now = input.currentTime
  if (!now) return 'default'

  const progress = clamp(input.workProgress, 0, 100)
  const minutesUntilOffwork = clamp(input.minutesUntilOffwork, 0, 24 * 60)
  const isWorkDay = input.isWorkDay ?? true

  if (!isWorkDay && mood === 'offwork') return 'weekend'
  if (input.isWorkTime && minutesUntilOffwork <= 30 && (mood === 'happy' || mood === 'excited' || mood === 'working')) return 'nearOffwork'
  if (isLateNight(now) && (mood === 'working' || mood === 'sleepy')) return 'night'
  if (isMorning(now) && (mood === 'idle' || mood === 'working') && progress <= 35) return 'morning'
  return 'default'
}

const petMessagesByContext: Partial<Record<PetMood, Partial<Record<PetMessageContext, readonly string[]>>>> = {
  working: {
    night: ['这会儿还在忙啊。', '夜里做事容易偏执，慢点。', '先把最关键的收住。', '别熬到头痛。', '别再加需求了，收。', '夜深了，留点力气。', '先把范围缩小。', '今晚先这样也行。', '我陪着，但别硬撑。', '别在凌晨争输赢。'],
    nearOffwork: ['快收工了，别开新坑。', '这会儿只做收尾。', '把最后一项勾掉就好。', '别再扩范围。', '剩下的明天继续也行。', '你已经做够多了。', '把这段推完就撤。', '别被小事拖住。', '我们马上下班。', '别临时加戏。'],
    morning: ['早上先别逼自己太紧。', '先把今天最重要的那件事写出来。', '慢慢进入状态。', '早上的脑子比较清。', '先做一小段热身。', '先别开太多窗口。', '今天先稳住。', '把咖啡留到需要的时候。'],
  },
  happy: {
    nearOffwork: ['还有半小时以内，稳稳收工。', '快到啦，别被小事绊住。', '把最后的确认过一遍。', '收尾比速度更重要。', '别在终点乱改。', '做完就走。', '关电脑的味道来了。', '把今天结束得体面点。', '马上就自由了。', '别回头看未读消息。'],
  },
  offwork: {
    weekend: ['今天不打卡，挺好。', '周末就别想工作了。', '把自己捞回来。', '今天只负责休息。', '随便走走也算安排。', '别把焦虑带进假期。', '睡到自然醒也行。', '今天不需要效率。', '放空一下。', '你值得休息。'],
  },
}

export function pickPetMessageWithContext(mood: PetMood, context: PetMessageContext, seed: number) {
  const list = petMessagesByContext[mood]?.[context] ?? petMessages[mood] ?? []
  if (list.length === 0) return ''
  const safeSeed = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0
  return list[safeSeed % list.length] ?? list[0] ?? ''
}

export const hoverMessages: readonly string[] = [
  '今天也在努力摸鱼吗？',
  '我陪你上班。',
  '快下班了吗？',
  '你赚的钱，我先帮你守着。',
  '休息一下也没关系。',
  '今天的小鱼干到账了吗？',
  '先别急，慢一点。',
  '你看起来有点累。',
  '别把眉头皱太久。',
  '给自己留点余地。',
  '我路过，顺便陪你。',
  '别被消息牵着走。',
  '你已经做很多了。',
  '要不要喝口水？',
  '今天的进度挺稳。',
  '我替你看着时间。',
  '别怕，先做一小段。',
  '别再开新坑了。',
  '你可以慢一点。',
  '我不催你。',
  '把肩放松。',
  '把脑子放回正中间。',
  '先把这段写完。',
  '要不要歇两分钟？',
  '别再盯着未读了。',
  '今天也算过关。',
  '我在这儿。',
  '你不是机器。',
  '收尾的时候别乱。',
  '等你点我一下。',
]

export function pickHoverMessage(seed: number) {
  const list = hoverMessages
  if (list.length === 0) return ''
  const safeSeed = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0
  return list[safeSeed % list.length] ?? list[0] ?? ''
}

export function getHoverMessageContext(input: PetMoodInput, mood: PetMood): HoverMessageContext {
  const now = input.currentTime
  if (now && isLateNight(now)) return 'night'
  if (!input.isWorkTime) return 'offwork'
  if (input.minutesUntilOffwork <= 30) return 'nearOffwork'
  if (mood === 'working' || mood === 'tired' || mood === 'sleepy') return 'working'
  return 'default'
}

const hoverMessagesByContext: Partial<Record<HoverMessageContext, readonly string[]>> = {
  night: ['这么晚还没收工？', '夜里别硬撑。', '先保存，别逞强。', '眼睛也要下班。', '把灯调暖一点。', '今晚先这样。', '别再加任务了。', '先去喝水。'],
  nearOffwork: ['还有一点点，别急。', '快下班了，稳住。', '收个尾就走。', '别在最后开新坑。', '这会儿只做收尾。', '关电脑的味道来了。', '别被小事拖住。', '做完就撤。'],
  offwork: ['下班了就别想工作。', '去休息吧。', '今天就到这儿。', '别再打开邮箱了。', '你的时间回来了。', '走，去喘口气。', '关掉通知。', '把工作留在今天。'],
  working: ['我陪你把这段走完。', '别被消息带走。', '先做一小段。', '把任务切小一点。', '别硬扛，稳住。', '你已经很努力了。', '我们慢慢推进。', '不需要完美。'],
}

export function pickHoverMessageWithContext(context: HoverMessageContext, seed: number) {
  const list = hoverMessagesByContext[context] ?? hoverMessages
  if (list.length === 0) return ''
  const safeSeed = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0
  return list[safeSeed % list.length] ?? list[0] ?? ''
}
