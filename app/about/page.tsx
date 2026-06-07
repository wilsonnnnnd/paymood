import React from 'react'
import LegalPage from '../../components/LegalPage'

export const metadata = {
  title: '关于 | PayMood',
  description: '关于 PayMood 工作日进度与预估收入仪表盘。',
}

export default function AboutPage() {
  return (
    <LegalPage
      eyebrow="paymood.work"
      title="关于"
      subtitle="一个安静的工作日进度仪表盘。"
      ariaLabel="关于 PayMood"
      sections={[
        {
          title: '它做什么',
          description:
            'PayMood 会显示你的工作日进度、剩余时间，以及到目前为止的预估已赚收入。',
          body: [
            '它适合上班族、兼职工作者、学生、自由职业者，以及任何想用简单视觉方式感受一天进度的人。',
          ],
        },
        {
          title: '它不是什么',
          description: 'PayMood 不是工资系统、税务计算器、HR 系统，也不是财务建议。',
          body: [
            '这里的数字刻意保持简单透明，适合用来获得方向感和一点动力；正式工资记录和义务仍以雇主、合同、工资单、会计、税务机关或其他合格来源为准。',
          ],
        },
        {
          title: '它如何构建',
          description: 'PayMood 是浏览器优先的轻量工具，核心设置会保存在你的设备上。',
          body: [
            '当前版本使用本机浏览器存储保存偏好设置，不需要账号、后端数据库或工资系统集成。',
          ],
        },
      ]}
    />
  )
}
