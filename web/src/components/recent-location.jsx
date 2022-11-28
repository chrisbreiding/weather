import cs from 'classnames'
import React, { useEffect, useRef } from 'react'
import { observer, useObservable } from 'mobx-react-lite'
import { action } from 'mobx'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons'

const stop = (e) => {
  e.stopPropagation()
}

let wasEditing

const RecentLocation = observer(({ location, onEdit, onSelect, onRemove }) => {
  const state = useObservable({
    isEditing: false,

    setIsEditing: action((isEditing) => {
      state.isEditing = isEditing
    }),
  })

  const toggleEditing = (e) => {
    e.stopPropagation()

    state.setIsEditing(!state.isEditing)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    state.setIsEditing(false)
  }

  const update = (e) => {
    onEdit(e.target.value)
  }

  const onEsc = action((e) => {
    if (e.key === 'Escape') {
      state.setIsEditing(false)
    }
  })

  const descriptionRef = useRef()

  useEffect(() => {
    wasEditing = false
  }, [true])

  useEffect(() => {
    if (!wasEditing && state.isEditing) {
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
      <button className='edit' onClick={toggleEditing}><Icon icon={faPenToSquare} /></button>
      <button className='remove' onClick={onRemove}><Icon icon={faTrashCan} /></button>
    </li>
  )
})

export default RecentLocation
