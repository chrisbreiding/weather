import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { setDefaultLocation } from '../lib/data'

export const NoLocation = () => {
  const navigate = useNavigate()

  useEffect(() => {
    setDefaultLocation().then((path) => {
      if (path) {
        navigate(path)
      }
    })
  })

  return null
}
