import { ory } from '../../../pkg/sdk'
import { FormEventHandler, useEffect, useState } from 'react'
import Link from 'next/link'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { Session, SettingsFlow } from '@ory/client'
import useFlow from '@/src/hooks/useFlow'

interface qr_details {
  enabled: boolean
  totp_qr: string
}

const TotpPage = () => {
  const router = useRouter()
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [flow, setFlow] = useState<SettingsFlow>()
  const { getCsrfToken } = useFlow()

  const [qr_details, setQrDetails] = useState<qr_details | undefined>(undefined)

  useEffect(() => {
    ory
      .toSession()
      .then(({ data }) => {
        setSession(data)
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 403:
          case 422:
            return router.push('/login?aal=aal2')
          case 401:
            return
        }
        return Promise.reject(err)
      })

    ory
      .createBrowserSettingsFlow()
      .then(({ data }) => {
        data.ui.nodes
          .filter((node) => node.group === 'totp')
          .forEach((node) => {
            if (node.attributes.id === 'totp_qr') {
              setQrDetails({
                enabled: false,
                totp_qr: node.attributes.src,
              })
            }
          })
      })
      .catch(({ err }) => {
        console.log(err)
      })
  }, [router])

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    if (!flow) {
      return <div>Flow not found</div>
    }

    const csrf_token = getCsrfToken(flow)

    ory.updateSettingsFlow({
      flow: flow.id,
      updateSettingsFlowBody: {
        csrf_token: csrf_token,
        method: 'totp',
        totp_code: '123456',
      },
    })
  }

  if (session && qr_details) {
    return (
      <>
        <img src={qr_details.totp_qr} />
        <form onSubmit={handleSubmit}>
          <input type='text' name='totp_code' />
          <button type='submit'>Submit</button>
        </form>
      </>
    )
  }

  if (session) {
    return <>テスト</>
  }

  return (
    <>
      <Link href='/login' passHref>
        ログイン
      </Link>
      <br />
      <Link href='/registration' passHref>
        登録
      </Link>
    </>
  )
}

export default TotpPage
