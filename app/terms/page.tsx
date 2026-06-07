import React from 'react'
import Link from 'next/link'
import LegalPage from '../../components/LegalPage'

export const metadata = {
  title: '条款 | PayMood',
  description: '使用 PayMood 的基本条款。',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="条款"
      subtitle="最后更新：2026 年 5 月 22 日"
      ariaLabel="条款"
      sections={[
        {
          title: '使用 PayMood',
          description: 'PayMood 提供一个用于查看工作日进度和预估收入的简单仪表盘。',
          body: [
            '使用 PayMood 即表示你同意仅将其用于合法、个人且合理的目的。你不得尝试干扰站点、滥用自动化流量，或以损害其他用户或站点运营者的方式使用服务。',
          ],
        },
        {
          title: '仅为估算',
          description: 'PayMood 显示的收入、进度、周累计和月累计都只是估算。',
          body: [
            'PayMood 不知道你的完整雇佣合同、税务情况、扣款、加班规则、养老金、发薪日历、无薪假或雇主特定政策。你需要自行核对实际工资、工时表、工资单、合同和税务义务。',
            '请不要将 PayMood 作为财务、法律、税务、工资、HR 或雇佣建议来依赖。',
          ],
        },
        {
          title: '可用性',
          description: 'PayMood 按现状提供，可能随时更改、暂停或停止。',
          body: [
            '站点运营者不保证 PayMood 始终可用、没有错误、绝对安全或完全准确。在法律允许的最大范围内，PayMood 不提供任何形式的保证。',
          ],
        },
        {
          title: '更新',
          description: '这些条款可能会随着产品变化而更新。',
          body: [
            <>
              更新后继续使用，即表示你接受最新条款。问题可以通过<Link href="/contact">联系</Link>页面发送。
            </>,
          ],
        },
      ]}
    />
  )
}
