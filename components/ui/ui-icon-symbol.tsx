import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { ComponentProps } from 'react'
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native'

type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name']
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name']

export type UiIconSymbolName =
  | 'house.fill'
  | 'brackets.curly'
  | 'dot.radiowaves.right'
  | 'list.bullet'
  | 'gearshape.fill'
  | 'ladybug.fill'

const MATERIAL_COMMUNITY_ICON_MAP: Partial<Record<UiIconSymbolName, MaterialCommunityIconName>> = {
  'house.fill': 'home',
  'brackets.curly': 'tournament',
  'list.bullet': 'format-list-bulleted',
  'gearshape.fill': 'cog',
  'ladybug.fill': 'bug',
}

const MATERIAL_ICON_MAP: Partial<Record<UiIconSymbolName, MaterialIconName>> = {
  'dot.radiowaves.right': 'wifi-tethering',
}

export function UiIconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: UiIconSymbolName
  size?: number
  color: string | OpaqueColorValue
  style?: StyleProp<TextStyle>
}) {
  if (MATERIAL_ICON_MAP[name]) {
    return (
      <MaterialIcons
        name={MATERIAL_ICON_MAP[name]!}
        size={size}
        color={color}
        style={style}
      />
    )
  }

  return (
    <MaterialCommunityIcons
      name={MATERIAL_COMMUNITY_ICON_MAP[name]!}
      size={size}
      color={color}
      style={style}
    />
  )
}
