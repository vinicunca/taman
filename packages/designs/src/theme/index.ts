import { parseThemeClasses } from './parse-theme-classes.ts';
import { themeAccordion } from './pohon-themes/theme.accordion.ts';
import { themeAlert } from './pohon-themes/theme.alert.ts';
import { themeAvatar, themeAvatarGroup } from './pohon-themes/theme.avatar.ts';
import { themeBadge } from './pohon-themes/theme.badge.ts';
import { themeBanner } from './pohon-themes/theme.banner.ts';
import { themeBreadcrumb } from './pohon-themes/theme.breadcrumb.ts';
import { themeButton } from './pohon-themes/theme.button.ts';
import { themeCalendar } from './pohon-themes/theme.calendar.ts';
import { themeCard } from './pohon-themes/theme.card.ts';
import { themeCarousel } from './pohon-themes/theme.carousel.ts';
import { themeChangelogVersion } from './pohon-themes/theme.changelog-version.ts';
import { themeChangelogVersions } from './pohon-themes/theme.changelog-versions.ts';
import {
  themeChatMessage,
  themeChatMessages,
  themeChatPalette,
  themeChatPrompt,
  themeChatReasoning,
  themeChatShimmer,
  themeChatTool,
} from './pohon-themes/theme.chats.ts';
import { themeCheckboxGroup } from './pohon-themes/theme.checkbox-group.ts';
import { themeCheckbox } from './pohon-themes/theme.checkbox.ts';
import { themeChip } from './pohon-themes/theme.chip.ts';
import { themeCollapsible } from './pohon-themes/theme.collapsible.ts';
import { themeColorPicker } from './pohon-themes/theme.color-picker.ts';
import { themeCommandPalette } from './pohon-themes/theme.command-palette.ts';
import { themeContainer } from './pohon-themes/theme.container.ts';
import { themeContextMenu } from './pohon-themes/theme.context-menu.ts';
import { themeDrawer } from './pohon-themes/theme.drawer.ts';
import { themeDropdownMenu } from './pohon-themes/theme.dropdown-menu.ts';
import { themeEmpty } from './pohon-themes/theme.empty.ts';
import { themeError } from './pohon-themes/theme.error.ts';
import { themeFieldGroup } from './pohon-themes/theme.field-group.ts';
import { themeFileUpload } from './pohon-themes/theme.file-upload.ts';
import { themeFooter, themeFooterColumns } from './pohon-themes/theme.footer.ts';
import { themeFormField } from './pohon-themes/theme.form-field.ts';
import { themeForm } from './pohon-themes/theme.form.ts';
import { themeHeader } from './pohon-themes/theme.header.ts';
import { themeInputDate } from './pohon-themes/theme.input-date.ts';
import { themeInputMenu } from './pohon-themes/theme.input-menu.ts';
import { themeInputNumber } from './pohon-themes/theme.input-number.ts';
import { themeInputRating } from './pohon-themes/theme.input-rating.ts';
import { themeInputTags } from './pohon-themes/theme.input-tags.ts';
import { themeInputTime } from './pohon-themes/theme.input-time.ts';
import { themeInput } from './pohon-themes/theme.input.ts';
import { themeKbd } from './pohon-themes/theme.kbd.ts';
import { themeLink } from './pohon-themes/theme.link.ts';
import { themeListbox } from './pohon-themes/theme.listbox.ts';
import { themeMain } from './pohon-themes/theme.main.ts';
import { themeMarquee } from './pohon-themes/theme.marquee.ts';
import { themeModal } from './pohon-themes/theme.modal.ts';
import { themeNavigationMenu } from './pohon-themes/theme.navigation-menu.ts';
import { themePagination } from './pohon-themes/theme.pagination.ts';
import { themePinInput } from './pohon-themes/theme.pin-input.ts';
import { themePopover } from './pohon-themes/theme.popover.ts';
import { themeProgress } from './pohon-themes/theme.progress.ts';
import { prose } from './pohon-themes/theme.prose.ts';
import { themeRadioGroup } from './pohon-themes/theme.radio-group.ts';
import { themeScrollArea } from './pohon-themes/theme.scroll-area.ts';
import { themeSelectMenu } from './pohon-themes/theme.select-menu.ts';
import { themeSelect } from './pohon-themes/theme.select.ts';
import { themeSeparator } from './pohon-themes/theme.separator.ts';
import { themeSidebar } from './pohon-themes/theme.sidebar.ts';
import { themeSkeleton } from './pohon-themes/theme.skeleton.ts';
import { themeSlideover } from './pohon-themes/theme.slideover.ts';
import { themeSlider } from './pohon-themes/theme.slider.ts';
import { themeStepper } from './pohon-themes/theme.stepper.ts';
import { themeSwitch } from './pohon-themes/theme.switch.ts';
import { themeTable } from './pohon-themes/theme.table.ts';
import { themeTabs } from './pohon-themes/theme.tabs.ts';
import { themeTextarea } from './pohon-themes/theme.textarea.ts';
import { themeTimeline } from './pohon-themes/theme.timeline.ts';
import { themeToast } from './pohon-themes/theme.toast.ts';
import { themeToaster } from './pohon-themes/theme.toaster.ts';
import { themeTooltip } from './pohon-themes/theme.tooltip.ts';
import { themeTree } from './pohon-themes/theme.tree.ts';
import { themeUser } from './pohon-themes/theme.user.ts';

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
export { vitePohonTheme } from './vite-plugin.ts';
