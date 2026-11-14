import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { NavGroup, NavLink, NavTree } from '@soroush.tech/design-system/NavTree'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'
import { NAV_GROUPS } from './NavTreeCard.data'

export function NavTreeCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="NAV_TREE" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/nav-tree/`} />
      }
      caption="Plain links and lists, so it works with scripts off. The current page is a filled pill; a collapsible group is a native details."
    >
      <View as="nav" aria-label="Documentation">
        <NavTree>
          {NAV_GROUPS.map((group) => (
            <NavGroup
              key={group.label}
              label={group.label}
              isCollapsible={group.isCollapsible}
              isOpen={group.isCollapsible}
            >
              {group.links.map((link) => (
                <NavLink key={link.label} href="#" isCurrent={link.isCurrent} note={link.note}>
                  {link.label}
                </NavLink>
              ))}
            </NavGroup>
          ))}
        </NavTree>
      </View>
    </Card>
  )
}
