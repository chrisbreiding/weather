import cs from 'classnames'
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { action, observable } from 'mobx'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faPen,
  faTrashAlt,
} from '@fortawesome/fontawesome-pro-light'

@observer
class RecentLocation extends Component {
  @observable isEditing = false

  render () {
    const { location, onSelect, onRemove } = this.props
    return (
      <li className={cs({ 'is-editing': this.isEditing })}>
        <form className='description' onSubmit={this._onSubmit} onClick={this._stop}>
          <input ref='description' value={location.description} onChange={this._update} onKeyUp={this._onEsc} />
        </form>
        <div className='description' onClick={onSelect}>{location.description}</div>
        <button className='edit' onClick={this._toggleEditing}><Icon icon={faPen} /></button>
        <button className='remove' onClick={onRemove}><Icon icon={faTrashAlt} /></button>
      </li>
    )
  }

  componentDidUpdate () {
    if (!this.wasEditing && this.isEditing) {
      this.refs.description.focus()
      const descriptionLength = this.props.location.description.length
      this.refs.description.setSelectionRange(descriptionLength, descriptionLength)
    }
    this.wasEditing = this.isEditing
  }

  @action _toggleEditing = (e) => {
    e.stopPropagation()

    this.isEditing = !this.isEditing
  }

  @action _onSubmit = (e) => {
    e.preventDefault()
    this.isEditing = false
  }

  _update = (e) => {
    this.props.onEdit(e.target.value)
  }

  @action _onEsc = (e) => {
    if (e.key === 'Escape') {
      this.isEditing = false
    }
  }

  _stop = (e) => {
    e.stopPropagation()
  }
}

export default RecentLocation
