import { parseThemeClasses } from './parse-theme-classes.ts';
import { themeAccordion } from './theme/theme.accordion.ts';
import { themeAlert } from './theme/theme.alert.ts';
import { themeAvatar, themeAvatarGroup } from './theme/theme.avatar.ts';
import { themeBadge } from './theme/theme.badge.ts';
import { banner } from './theme/theme.banner.ts';
import { breadcrumb } from './theme/theme.breadcrumb.ts';
import { button } from './theme/theme.button.ts';
import { calendar } from './theme/theme.calendar.ts';
import { card } from './theme/theme.card.ts';
import { carousel } from './theme/theme.carousel.ts';
import { changelogVersion } from './theme/theme.changelog-version.ts';
import { changelogVersions } from './theme/theme.changelog-versions.ts';
import { chatMessage } from './theme/theme.chat-message.ts';
import { chatMessages } from './theme/theme.chat-messages.ts';
import { chatPalette } from './theme/theme.chat-palette.ts';
import { chatPromptSubmit } from './theme/theme.chat-prompt-submit.ts';
import { chatPrompt } from './theme/theme.chat-prompt.ts';
import { chatReasoning } from './theme/theme.chat-reasoning.ts';
import { chatShimmer } from './theme/theme.chat-shimmer.ts';
import { chatTool } from './theme/theme.chat-tool.ts';
import { checkboxGroup } from './theme/theme.checkbox-group.ts';
import { checkbox } from './theme/theme.checkbox.ts';
import { chip } from './theme/theme.chip.ts';
import { collapsible } from './theme/theme.collapsible.ts';
import { colorPicker } from './theme/theme.color-picker.ts';
import { commandPalette } from './theme/theme.command-palette.ts';
import { container } from './theme/theme.container.ts';
import { contextMenu } from './theme/theme.context-menu.ts';
import { drawer } from './theme/theme.drawer.ts';
import { dropdownMenu } from './theme/theme.dropdown-menu.ts';
import { editorDragHandle } from './theme/theme.editor-drag-handle.ts';
import { editorEmojiMenu } from './theme/theme.editor-emoji-menu.ts';
import { editorMentionMenu } from './theme/theme.editor-mention-menu.ts';
import { editorSuggestionMenu } from './theme/theme.editor-suggestion-menu.ts';
import { editorToolbar } from './theme/theme.editor-toolbar.ts';
import { editor } from './theme/theme.editor.ts';
import { empty } from './theme/theme.empty.ts';
import { error } from './theme/theme.error.ts';
import { themeFieldGroup } from './theme/theme.field-group.ts';
import { fileUpload } from './theme/theme.file-upload.ts';
import { footerColumns } from './theme/theme.footer-columns.ts';
import { footer } from './theme/theme.footer.ts';
import { formField } from './theme/theme.form-field.ts';
import { form } from './theme/theme.form.ts';
import { header } from './theme/theme.header.ts';
import { themeInputDate } from './theme/theme.input-date.ts';
import { themeInputMenu } from './theme/theme.input-menu.ts';
import { themeInputNumber } from './theme/theme.input-number.ts';
import { themeInputTags } from './theme/theme.input-tags.ts';
import { themeInputTime } from './theme/theme.input-time.ts';
import { themeInput } from './theme/theme.input.ts';
import { kbd } from './theme/theme.kbd.ts';
import { link } from './theme/theme.link.ts';
import { listbox } from './theme/theme.listbox.ts';
import { main } from './theme/theme.main.ts';
import { marquee } from './theme/theme.marquee.ts';
import { modal } from './theme/theme.modal.ts';
import { navigationMenu } from './theme/theme.navigation-menu.ts';
import { pagination } from './theme/theme.pagination.ts';
import { pinInput } from './theme/theme.pin-input.ts';
import { popover } from './theme/theme.popover.ts';
import { progress } from './theme/theme.progress.ts';
import { prose } from './theme/theme.prose.ts';
import { radioGroup } from './theme/theme.radio-group.ts';
import { scrollArea } from './theme/theme.scroll-area.ts';
import { themeSelectMenu } from './theme/theme.select-menu.ts';
import { themeSelect } from './theme/theme.select.ts';
import { separator } from './theme/theme.separator.ts';
import { sidebar } from './theme/theme.sidebar.ts';
import { skeleton } from './theme/theme.skeleton.ts';
import { slideover } from './theme/theme.slideover.ts';
import { slider } from './theme/theme.slider.ts';
import { stepper } from './theme/theme.stepper.ts';
import { themeSwitch } from './theme/theme.switch.ts';
import { table } from './theme/theme.table.ts';
import { tabs } from './theme/theme.tabs.ts';
import { themeTextarea } from './theme/theme.textarea.ts';
import { timeline } from './theme/theme.timeline.ts';
import { themeToast } from './theme/theme.toast.ts';
import { themeToaster } from './theme/theme.toaster.ts';
import { themeTooltip } from './theme/theme.tooltip.ts';
import { tree } from './theme/theme.tree.ts';
import { user } from './theme/theme.user.ts';

export const ui = parseThemeClasses({
  accordion: themeAccordion,
  alert: themeAlert,
  avatarGroup: themeAvatarGroup,
  avatar: themeAvatar,
  badge: themeBadge,
  banner,
  breadcrumb,
  button,
  calendar,
  card,
  carousel,
  changelogVersion,
  changelogVersions,
  chatMessage,
  chatMessages,
  chatPalette,
  chatPromptSubmit,
  chatPrompt,
  chatReasoning,
  chatShimmer,
  chatTool,
  checkboxGroup,
  checkbox,
  chip,
  collapsible,
  colorPicker,
  commandPalette,
  container,
  contextMenu,
  drawer,
  dropdownMenu,
  editorDragHandle,
  editorEmojiMenu,
  editorMentionMenu,
  editorSuggestionMenu,
  editorToolbar,
  editor,
  empty,
  error,
  fieldGroup: themeFieldGroup,
  fileUpload,
  footerColumns,
  footer,
  formField,
  form,
  header,
  inputDate: themeInputDate,
  inputMenu: themeInputMenu,
  inputNumber: themeInputNumber,
  inputTags: themeInputTags,
  inputTime: themeInputTime,
  input: themeInput,
  kbd,
  link,
  listbox,
  main,
  marquee,
  modal,
  navigationMenu,
  pagination,
  pinInput,
  popover,
  progress,
  prose,
  radioGroup,
  scrollArea,
  selectMenu: themeSelectMenu,
  select: themeSelect,
  separator,
  sidebar,
  skeleton,
  slideover,
  slider,
  stepper,
  switch: themeSwitch,
  table,
  tabs,
  textarea: themeTextarea,
  timeline,
  toast: themeToast,
  toaster: themeToaster,
  tooltip: themeTooltip,
  tree,
  user,
});
