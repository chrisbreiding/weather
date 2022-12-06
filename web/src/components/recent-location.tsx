import cs from 'classnames'
import React, { useEffect, useRef } from 'react'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { action } from 'mobx'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import type { Location } from '../lib/location-store'

interface RecentLocationProps {
  location: Location
  onEdit: (value: string) => void
  onRemove: () => void
  onSelect: () => void
}

let wasEditing = false

export const RecentLocation = observer(({ location, onEdit, onSelect, onRemove }: RecentLocationProps) => {
  const state = useLocalObservable(() => ({
    isEditing: false,

    setIsEditing: action((isEditing: boolean) => {
      state.isEditing = isEditing
    }),
  }))

  const stop = (e: React.MouseEvent) => {
    // keep clicking within form from triggering global:click
    e.stopPropagation()
  }

  const toggleEditing = (e: React.MouseEvent) => {
    e.stopPropagation()

    state.setIsEditing(!state.isEditing)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    state.setIsEditing(false)
  }

  const update = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEdit(e.target.value)
  }

  const onEsc = action((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      state.setIsEditing(false)
    }
  })

  const _onRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove()
  }

  const descriptionRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    wasEditing = false
  }, [true])

  useEffect(() => {
    if (!wasEditing && state.isEditing && descriptionRef.current) {
      descriptionRef.current.focus()
      const descriptionLength = location.description.length

      descriptionRef.current.setSelectionRange(descriptionLength, descriptionLength)
    }

    wasEditing = state.isEditing
  })

  return (
    <li className={cs({ 'is-editing': state.isEditing })}>
      <form className='description' onSubmit={onSubmit} onClick={stop}>
        <input ref={descriptionRef} value={location.description} onChange={update} onKeyUp={onEsc} />
      </form>
      <div className='description' onClick={onSelect}>{location.description}</div>
      <button type='button' className='edit' onClick={toggleEditing}><Icon icon={faPenToSquare} /></button>
      <button type='button' className='remove' onClick={_onRemove}><Icon icon={faTrashCan} /></button>
    </li>
  )
})
