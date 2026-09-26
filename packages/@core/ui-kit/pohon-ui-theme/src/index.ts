import { parseThemeClasses } from './parse-theme-classes.ts';
import { themeAccordion } from './theme/theme.accordion.ts';
import { themeAlert } from './theme/theme.alert.ts';
import { themeAvatar, themeAvatarGroup } from './theme/theme.avatar.ts';
import { themeBadge } from './theme/theme.badge.ts';
import { themeBanner } from './theme/theme.banner.ts';
import { themeBreadcrumb } from './theme/theme.breadcrumb.ts';
import { themeButton } from './theme/theme.button.ts';
import { themeCalendar } from './theme/theme.calendar.ts';
import { themeCard } from './theme/theme.card.ts';
import { themeCarousel } from './theme/theme.carousel.ts';
import { themeChangelogVersion } from './theme/theme.changelog-version.ts';
import { themeChangelogVersions } from './theme/theme.changelog-versions.ts';
import {
  themeChatMessage,
  themeChatMessages,
  themeChatPalette,
  themeChatPrompt,
  themeChatReasoning,
  themeChatShimmer,
  themeChatTool,
} from './theme/theme.chats.ts';
import { themeCheckboxGroup } from './theme/theme.checkbox-group.ts';
import { themeCheckbox } from './theme/theme.checkbox.ts';
import { themeChip } from './theme/theme.chip.ts';
import { themeCollapsible } from './theme/theme.collapsible.ts';
import { themeColorPicker } from './theme/theme.color-picker.ts';
import { themeCommandPalette } from './theme/theme.command-palette.ts';
import { themeContainer } from './theme/theme.container.ts';
import { themeContextMenu } from './theme/theme.context-menu.ts';
import { themeDrawer } from './theme/theme.drawer.ts';
import { themeDropdownMenu } from './theme/theme.dropdown-menu.ts';
import { themeEmpty } from './theme/theme.empty.ts';
import { themeError } from './theme/theme.error.ts';
import { themeFieldGroup } from './theme/theme.field-group.ts';
import { themeFileUpload } from './theme/theme.file-upload.ts';
import { themeFooter, themeFooterColumns } from './theme/theme.footer.ts';
import { themeFormField } from './theme/theme.form-field.ts';
import { themeForm } from './theme/theme.form.ts';
import { themeHeader } from './theme/theme.header.ts';
import { themeInputDate } from './theme/theme.input-date.ts';
import { themeInputMenu } from './theme/theme.input-menu.ts';
import { themeInputNumber } from './theme/theme.input-number.ts';
import { themeInputRating } from './theme/theme.input-rating.ts';
import { themeInputTags } from './theme/theme.input-tags.ts';
import { themeInputTime } from './theme/theme.input-time.ts';
import { themeInput } from './theme/theme.input.ts';
import { themeKbd } from './theme/theme.kbd.ts';
import { themeLink } from './theme/theme.link.ts';
import { themeListbox } from './theme/theme.listbox.ts';
import { themeMain } from './theme/theme.main.ts';
import { themeMarquee } from './theme/theme.marquee.ts';
import { themeModal } from './theme/theme.modal.ts';
import { themeNavigationMenu } from './theme/theme.navigation-menu.ts';
import { themePagination } from './theme/theme.pagination.ts';
import { themePinInput } from './theme/theme.pin-input.ts';
import { themePopover } from './theme/theme.popover.ts';
import { themeProgress } from './theme/theme.progress.ts';
import { prose } from './theme/theme.prose.ts';
import { themeRadioGroup } from './theme/theme.radio-group.ts';
import { themeScrollArea } from './theme/theme.scroll-area.ts';
import { themeSelectMenu } from './theme/theme.select-menu.ts';
import { themeSelect } from './theme/theme.select.ts';
import { themeSeparator } from './theme/theme.separator.ts';
import { themeSidebar } from './theme/theme.sidebar.ts';
import { themeSkeleton } from './theme/theme.skeleton.ts';
import { themeSlideover } from './theme/theme.slideover.ts';
import { themeSlider } from './theme/theme.slider.ts';
import { themeStepper } from './theme/theme.stepper.ts';
import { themeSwitch } from './theme/theme.switch.ts';
import { themeTable } from './theme/theme.table.ts';
import { themeTabs } from './theme/theme.tabs.ts';
import { themeTextarea } from './theme/theme.textarea.ts';
import { themeTimeline } from './theme/theme.timeline.ts';
import { themeToast } from './theme/theme.toast.ts';
import { themeToaster } from './theme/theme.toaster.ts';
import { themeTooltip } from './theme/theme.tooltip.ts';
import { themeTree } from './theme/theme.tree.ts';
import { themeUser } from './theme/theme.user.ts';

export const ui = parseThemeClasses({
  accordion: themeAccordion,
  alert: themeAlert,
  avatarGroup: themeAvatarGroup,
  avatar: themeAvatar,
  badge: themeBadge,
  banner: themeBanner,
  breadcrumb: themeBreadcrumb,
  button: themeButton,
  calendar: themeCalendar,
  card: themeCard,
  carousel: themeCarousel,
  changelogVersion: themeChangelogVersion,
  changelogVersions: themeChangelogVersions,
  chatMessage: themeChatMessage,
  chatMessages: themeChatMessages,
  chatPalette: themeChatPalette,
  chatPrompt: themeChatPrompt,
  chatReasoning: themeChatReasoning,
  chatShimmer: themeChatShimmer,
  chatTool: themeChatTool,
  checkboxGroup: themeCheckboxGroup,
  checkbox: themeCheckbox,
  chip: themeChip,
  collapsible: themeCollapsible,
  colorPicker: themeColorPicker,
  commandPalette: themeCommandPalette,
  container: themeContainer,
  contextMenu: themeContextMenu,
  drawer: themeDrawer,
  dropdownMenu: themeDropdownMenu,
  empty: themeEmpty,
  error: themeError,
  fieldGroup: themeFieldGroup,
  fileUpload: themeFileUpload,
  footerColumns: themeFooterColumns,
  footer: themeFooter,
  formField: themeFormField,
  form: themeForm,
  header: themeHeader,
  inputDate: themeInputDate,
  inputMenu: themeInputMenu,
  inputNumber: themeInputNumber,
  inputTags: themeInputTags,
  inputTime: themeInputTime,
  input: themeInput,
  inputRating: themeInputRating,
  kbd: themeKbd,
  link: themeLink,
  listbox: themeListbox,
  main: themeMain,
  marquee: themeMarquee,
  modal: themeModal,
  navigationMenu: themeNavigationMenu,
  pagination: themePagination,
  pinInput: themePinInput,
  popover: themePopover,
  progress: themeProgress,
  prose,
  radioGroup: themeRadioGroup,
  scrollArea: themeScrollArea,
  selectMenu: themeSelectMenu,
  select: themeSelect,
  separator: themeSeparator,
  sidebar: themeSidebar,
  skeleton: themeSkeleton,
  slideover: themeSlideover,
  slider: themeSlider,
  stepper: themeStepper,
  switch: themeSwitch,
  table: themeTable,
  tabs: themeTabs,
  textarea: themeTextarea,
  timeline: themeTimeline,
  toast: themeToast,
  toaster: themeToaster,
  tooltip: themeTooltip,
  tree: themeTree,
  user: themeUser,
});
