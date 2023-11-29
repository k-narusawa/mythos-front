import { useEffect, useState } from 'react'
import { ory } from '../../pkg/sdk'
import { Session } from '@ory/client'
import { AxiosError } from 'axios'
import { HttpError } from '@/src/types/error'
import { useHandleError } from '@/src/hooks/useHandleError'

const useSession = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<HttpError | null>(null)
  const handleError = useHandleError()

  useEffect(() => {
    ory
      .toSession()
      .then(({ data }) => {
        setIsLoading(false)
        setSession(data)
      })
      .catch((err: AxiosError) => {
        console.log(err)
        setIsLoading(false)
        switch (err.response?.status) {
          case 401:
            console.log(err)
            setSession(null)
            break
          default:
            console.log(err)
            setSession(null)
            setError(err.response ? new HttpError(err.response) : null)
            handleError(err)
            break
        }
        console.error(err)
      })
  }, [handleError])

  return { session, isLoading, error }
}

export default useSession
