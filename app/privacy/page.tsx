import React from 'react'
import Link from 'next/link'
import LegalPage from '../../components/LegalPage'

export const metadata = {
  title: '隐私政策 | PayMood',
  description: 'PayMood 如何处理本机设置、有限站点数据和可能的第三方服务。',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="隐私政策"
      subtitle="最后更新：2026 年 5 月 22 日"
      ariaLabel="隐私政策"
      sections={[
        {
          title: '概览',
          description: 'PayMood 是一个浏览器优先的工作日进度与预估收入仪表盘。',
          body: [
            '它不是工资系统、税务计算器、HR 工具，也不提供财务、法律或税务建议。',
            '本政策说明 PayMood 为运行仪表盘会使用哪些信息，以及这些信息如何被处理。',
          ],
        },
        {
          title: '本机设置',
          description:
            '你的工作时间、薪资显示偏好、货币、主题和类似设置会通过 localStorage 保存在浏览器中。',
          body: [
            '这些设置设计上会留在你的设备中。当前仪表盘体验不需要账号，也不会要求你提交工资单、税号、银行信息、雇主记录或其他敏感工资文件。',
            '你可以通过浏览器存储设置，或清除此网站的站点数据来删除这些信息。',
          ],
        },
        {
          title: '第三方服务',
          description:
            'PayMood 可能使用托管和广告服务；当站点启用广告时，其中可能包括 Google AdSense。',
          body: [
            '根据服务类型，这可能包括 cookies、设备标识符、IP 地址、浏览器信息、页面浏览、广告互动或 web beacons。第三方可能会按照其自身政策使用这些信息。',
            '包括 Google 在内的第三方供应商，可能会根据你之前访问 PayMood 或其他网站的情况，使用 cookies 投放广告。Google 广告 cookies 使 Google 及其合作伙伴能够根据你访问本站和互联网上其他网站的情况投放广告。',
            <>
              你可以通过{' '}
              <a href="https://www.google.com/settings/ads" rel="noreferrer" target="_blank">
                Google 广告设置
              </a>
              退出个性化广告。如果启用了其他第三方供应商或广告网络，它们也可能使用 cookies 投放广告，并提供自己的退出控制。
            </>,
          ],
        },
        {
          title: '站点 cookies',
          description: 'PayMood 使用一个小型站点 cookie 来记住是否应按地区关闭广告。',
          body: [
            'pm_ads cookie 只用于避免在站点所有者已关闭广告的地区显示 Google 广告。它不会用作账号登录、工资标识或薪资记录。',
          ],
        },
        {
          title: '联系',
          description: '关于本政策的问题可以通过联系页面发送。',
          body: [
            <>
              请访问<Link href="/contact">联系</Link>查看当前联系方式。
            </>,
          ],
        },
      ]}
    />
  )
}
