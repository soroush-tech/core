import AccountTreeIcon from 'src/assets/icons/account_tree.svg?react'
import AdsClickIcon from 'src/assets/icons/ads_click.svg?react'
import AnalyticsIcon from 'src/assets/icons/analytics.svg?react'
import ArchitectureIcon from 'src/assets/icons/architecture.svg?react'
import ArrowBackIcon from 'src/assets/icons/arrow_back.svg?react'
import ArrowForwardIcon from 'src/assets/icons/arrow_forward.svg?react'
import CheckIcon from 'src/assets/icons/check.svg?react'
import CloudDoneIcon from 'src/assets/icons/cloud_done.svg?react'
import CloseIcon from 'src/assets/icons/close.svg?react'
import CodeIcon from 'src/assets/icons/code.svg?react'
import ContentCopyIcon from 'src/assets/icons/content_copy.svg?react'
import CookieIcon from 'src/assets/icons/cookie.svg?react'
import DatabaseIcon from 'src/assets/icons/database.svg?react'
import DesktopWindowsIcon from 'src/assets/icons/desktop_windows.svg?react'
import DnsIcon from 'src/assets/icons/dns.svg?react'
import ExpandLessIcon from 'src/assets/icons/expand_less.svg?react'
import ExpandMoreIcon from 'src/assets/icons/expand_more.svg?react'
import ExternalLinkIcon from 'src/assets/icons/external_link.svg?react'
import GridViewIcon from 'src/assets/icons/grid_view.svg?react'
import GroupsIcon from 'src/assets/icons/groups.svg?react'
import HubIcon from 'src/assets/icons/hub.svg?react'
import LanguageIcon from 'src/assets/icons/language.svg?react'
import LockIcon from 'src/assets/icons/lock.svg?react'
import MenuIcon from 'src/assets/icons/menu.svg?react'
import NeurologyIcon from 'src/assets/icons/neurology.svg?react'
import PsychologyIcon from 'src/assets/icons/psychology.svg?react'
import RebaseEditIcon from 'src/assets/icons/rebase_edit.svg?react'
import SchemaIcon from 'src/assets/icons/schema.svg?react'
import SecurityIcon from 'src/assets/icons/security.svg?react'
import SettingsInputComponentIcon from 'src/assets/icons/settings_input_component.svg?react'
import SmartToyIcon from 'src/assets/icons/smart_toy.svg?react'
import SmartphoneIcon from 'src/assets/icons/smartphone.svg?react'
import SpeedIcon from 'src/assets/icons/speed.svg?react'
import StacksIcon from 'src/assets/icons/stacks.svg?react'
import TerminalIcon from 'src/assets/icons/terminal.svg?react'
import VisibilityIcon from 'src/assets/icons/visibility.svg?react'
import WarningIcon from 'src/assets/icons/warning.svg?react'
import WebAssetIcon from 'src/assets/icons/web_asset.svg?react'

/** Registry of available icons, keyed by their asset file name. */
export const icons = {
  account_tree: AccountTreeIcon,
  ads_click: AdsClickIcon,
  analytics: AnalyticsIcon,
  architecture: ArchitectureIcon,
  arrow_back: ArrowBackIcon,
  arrow_forward: ArrowForwardIcon,
  check: CheckIcon,
  cloud_done: CloudDoneIcon,
  close: CloseIcon,
  code: CodeIcon,
  content_copy: ContentCopyIcon,
  cookie: CookieIcon,
  database: DatabaseIcon,
  desktop_windows: DesktopWindowsIcon,
  dns: DnsIcon,
  expand_less: ExpandLessIcon,
  expand_more: ExpandMoreIcon,
  external_link: ExternalLinkIcon,
  grid_view: GridViewIcon,
  groups: GroupsIcon,
  hub: HubIcon,
  language: LanguageIcon,
  lock: LockIcon,
  menu: MenuIcon,
  neurology: NeurologyIcon,
  psychology: PsychologyIcon,
  rebase_edit: RebaseEditIcon,
  schema: SchemaIcon,
  security: SecurityIcon,
  settings_input_component: SettingsInputComponentIcon,
  smart_toy: SmartToyIcon,
  smartphone: SmartphoneIcon,
  speed: SpeedIcon,
  stacks: StacksIcon,
  terminal: TerminalIcon,
  visibility: VisibilityIcon,
  warning: WarningIcon,
  web_asset: WebAssetIcon,
} as const

/** Valid values for the Icon `name` prop — derived from the registry keys. */
export type IconName = keyof typeof icons
