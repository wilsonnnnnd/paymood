import React from 'react'
import LegalPage from '../../components/LegalPage'

export const metadata = {
  title: '联系 | PayMood',
  description: '联系 PayMood。',
}

export default function ContactPage() {
  return (
    <LegalPage
      title="联系"
      subtitle="问题、反馈和政策请求。"
      ariaLabel="联系 PayMood"
      sections={[
        {
          title: '邮箱',
          description: '产品反馈、隐私问题或站点问题都可以通过这个方式联系。',
          body: [
            <>
              邮箱：<a href="mailto:dididimomomo77@gmail.com">dididimomomo77@gmail.com</a>
            </>,
            '这个地址用于接收站点反馈、隐私问题和广告政策相关请求。',
          ],
        },
        {
          title: '有用信息',
          description: '请附上页面、浏览器、设备，以及发生了什么的简短说明。',
          body: [
            '请不要发送银行信息、税号、工资单、密码或其他敏感工资文件。PayMood 不需要这些信息来处理一般站点反馈。',
          ],
        },
      ]}
    />
  )
}
