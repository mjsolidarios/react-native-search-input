import React, { Component } from 'react'
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
} from 'react-native'
import PropTypes from 'prop-types'
import { createFilter } from './util'

export default class SearchInput extends Component {
  static defaultProps = {
    onChange: () => { },
    caseSensitive: false,
    fuzzy: false,
    throttle: 200,
    clearIcon: null,
    inputViewStyles: {},
    clearIconViewStyles: {
      position: 'absolute',
      top: 18,
      right: 22
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      searchTerm: this.props.value || '',
      inputFocus: props.inputFocus,
    }
    this._keyboardDidHide = this._keyboardDidHide.bind(this)
  }

  componentWillMount () {
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount () {
    this.keyboardDidHideListener.remove();
  }

  componentWillReceiveProps(nextProps) {    
    if (this.state.inputFocus !== nextProps.inputFocus) {
      this.input.focus()
    }
    if (typeof nextProps.value !== 'undefined' && nextProps.value !== this.props.value) {
      const e = {
        target: {
          value: nextProps.value,
        }
      }
      this.updateSearch(e)
    }
  }

  _keyboardDidHide() {
    if (this.state.inputFocus) {
      this.setState({ inputFocus: false })
    }
  }

  renderClearIcon() {
    const { clearIcon, clearIconViewStyles, onChangeText } = this.props
    return clearIcon &&
      <TouchableOpacity
        onPress={() => {
          onChangeText('')
          this.input.clear()
        }}
        style={clearIconViewStyles}
      >
        {clearIcon}
      </TouchableOpacity>
  }

  render() {
    const {
      style,
      onChange,
      caseSensitive,
      sortResults,
      throttle,
      filterKeys,
      value,
      fuzzy,
      ...inputProps
    } = this.props // eslint-disable-line no-unused-vars
    const {searchTerm} = this.state;

    inputProps.type = inputProps.type || 'search'
    inputProps.value = searchTerm
    inputProps.onChange = this.updateSearch.bind(this)
    inputProps.placeholder = inputProps.placeholder || 'Search'
    return (
      <View style={this.props.inputViewStyles}>
        <TextInput
          style={style}
          {...inputProps}  // Inherit any props passed to it; e.g., multiline, numberOfLines below
          underlineColorAndroid={'rgba(0,0,0,0)'}
          ref={(input) => { this.input = input }}
          returnKeyType={this.props.returnKeyType}
          onSubmitEditing={this.props.onSubmitEditing}
        />
        {this.renderClearIcon()}
      </View>
    )
  }

  updateSearch(e) {
    const searchTerm = e.target.value
    this.setState({
      searchTerm: searchTerm
    }, () => {
      if (this._throttleTimeout) {
        clearTimeout(this._throttleTimeout)
      }

      this._throttleTimeout = setTimeout(
        () => this.props.onChange(searchTerm),
        this.props.throttle
      )
    })
  }

  filter(keys) {
    const { filterKeys, caseSensitive, fuzzy, sortResults } = this.props
    return createFilter(
      this.state.searchTerm,
      keys || filterKeys,
      { caseSensitive, fuzzy, sortResults }
    )
  }
}

SearchInput.propTypes = {
  onChange: PropTypes.func,
  caseSensitive: PropTypes.bool,
  sortResults: PropTypes.bool,
  fuzzy: PropTypes.bool,
  throttle: PropTypes.number,
  filterKeys: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  value: PropTypes.string,
  clearIcon: PropTypes.node,
  inputViewStyles: PropTypes.object,
  onSubmitEditing: PropTypes.func,
  inputFocus: PropTypes.bool,
  clearIconViewStyles: PropTypes.object,
}

export { createFilter }
