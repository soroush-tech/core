import { describe, expect, it } from 'vitest'
import propTypes, { createPropTypes, propType } from './prop-types'

describe('propType', () => {
  it('is a prop-types validator function', () => {
    expect(typeof propType).toBe('function')
  })
})

describe('createPropTypes', () => {
  it('maps each prop name to the shared validator', () => {
    expect(createPropTypes(['margin', 'padding'])).toEqual({
      margin: propType,
      padding: propType,
    })
  })

  it('returns an empty map for no props', () => {
    expect(createPropTypes([])).toEqual({})
  })
})

describe('default propTypes map', () => {
  it('exposes a map per style group', () => {
    expect(Object.keys(propTypes)).toEqual([
      'space',
      'color',
      'layout',
      'typography',
      'flexbox',
      'border',
      'background',
      'position',
      'grid',
      'shadow',
      'buttonStyle',
      'textStyle',
      'colorStyle',
    ])
  })

  it('derives each map from its parser propNames', () => {
    expect(propTypes.space.margin).toBe(propType)
    expect(propTypes.color.color).toBe(propType)
    expect(propTypes.buttonStyle.variant).toBe(propType)
    expect(propTypes.textStyle.textStyle).toBe(propType)
    expect(propTypes.colorStyle.colors).toBe(propType)
  })
})
