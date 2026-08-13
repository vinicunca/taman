import { parseThemeClasses } from './parse-theme-classes.ts';
import { accordion } from './theme/accordion.ts';
import { alert } from './theme/alert.ts';
import { authForm } from './theme/auth-form.ts';
import { avatarGroup } from './theme/avatar-group.ts';
import { avatar } from './theme/avatar.ts';
import { badge } from './theme/badge.ts';
import { banner } from './theme/banner.ts';
import { blogPost } from './theme/blog-post.ts';
import { blogPosts } from './theme/blog-posts.ts';
import { breadcrumb } from './theme/breadcrumb.ts';
import { button } from './theme/button.ts';
import { calendar } from './theme/calendar.ts';
import { card } from './theme/card.ts';
import { carousel } from './theme/carousel.ts';
import { changelogVersion } from './theme/changelog-version.ts';
import { changelogVersions } from './theme/changelog-versions.ts';
import { chatMessage } from './theme/chat-message.ts';
import { chatMessages } from './theme/chat-messages.ts';
import { chatPalette } from './theme/chat-palette.ts';
import { chatPromptSubmit } from './theme/chat-prompt-submit.ts';
import { chatPrompt } from './theme/chat-prompt.ts';
import { chatReasoning } from './theme/chat-reasoning.ts';
import { chatShimmer } from './theme/chat-shimmer.ts';
import { chatTool } from './theme/chat-tool.ts';
import { checkboxGroup } from './theme/checkbox-group.ts';
import { checkbox } from './theme/checkbox.ts';
import { chip } from './theme/chip.ts';
import { collapsible } from './theme/collapsible.ts';
import { colorPicker } from './theme/color-picker.ts';
import { commandPalette } from './theme/command-palette.ts';
import { container } from './theme/container.ts';
import { contextMenu } from './theme/context-menu.ts';
import { dashboardGroup } from './theme/dashboard-group.ts';
import { dashboardNavbar } from './theme/dashboard-navbar.ts';
import { dashboardPanel } from './theme/dashboard-panel.ts';
import { dashboardResizeHandle } from './theme/dashboard-resize-handle.ts';
import { dashboardSearchButton } from './theme/dashboard-search-button.ts';
import { dashboardSearch } from './theme/dashboard-search.ts';
import { dashboardSidebarCollapse } from './theme/dashboard-sidebar-collapse.ts';
import { dashboardSidebarToggle } from './theme/dashboard-sidebar-toggle.ts';
import { dashboardSidebar } from './theme/dashboard-sidebar.ts';
import { dashboardToolbar } from './theme/dashboard-toolbar.ts';
import { drawer } from './theme/drawer.ts';
import { dropdownMenu } from './theme/dropdown-menu.ts';
import { editorDragHandle } from './theme/editor-drag-handle.ts';
import { editorEmojiMenu } from './theme/editor-emoji-menu.ts';
import { editorMentionMenu } from './theme/editor-mention-menu.ts';
import { editorSuggestionMenu } from './theme/editor-suggestion-menu.ts';
import { editorToolbar } from './theme/editor-toolbar.ts';
import { editor } from './theme/editor.ts';
import { empty } from './theme/empty.ts';
import { error } from './theme/error.ts';
import { fieldGroup } from './theme/field-group.ts';
import { fileUpload } from './theme/file-upload.ts';
import { footerColumns } from './theme/footer-columns.ts';
import { footer } from './theme/footer.ts';
import { formField } from './theme/form-field.ts';
import { form } from './theme/form.ts';
import { header } from './theme/header.ts';
import { inputDate } from './theme/input-date.ts';
import { inputMenu } from './theme/input-menu.ts';
import { inputNumber } from './theme/input-number.ts';
import { inputTags } from './theme/input-tags.ts';
import { inputTime } from './theme/input-time.ts';
import { input } from './theme/input.ts';
import { kbd } from './theme/kbd.ts';
import { link } from './theme/link.ts';
import { listbox } from './theme/listbox.ts';
import { main } from './theme/main.ts';
import { marquee } from './theme/marquee.ts';
import { modal } from './theme/modal.ts';
import { navigationMenu } from './theme/navigation-menu.ts';
import { pageAnchors } from './theme/page-anchors.ts';
import { pageAside } from './theme/page-aside.ts';
import { pageBody } from './theme/page-body.ts';
import { pageCard } from './theme/page-card.ts';
import { pageColumns } from './theme/page-columns.ts';
import { pageCta } from './theme/page-cta.ts';
import { pageFeature } from './theme/page-feature.ts';
import { pageGrid } from './theme/page-grid.ts';
import { pageHeader } from './theme/page-header.ts';
import { pageHero } from './theme/page-hero.ts';
import { pageLinks } from './theme/page-links.ts';
import { pageList } from './theme/page-list.ts';
import { pageLogos } from './theme/page-logos.ts';
import { pageSection } from './theme/page-section.ts';
import { page } from './theme/page.ts';
import { pagination } from './theme/pagination.ts';
import { pinInput } from './theme/pin-input.ts';
import { popover } from './theme/popover.ts';
import { pricingPlan } from './theme/pricing-plan.ts';
import { pricingPlans } from './theme/pricing-plans.ts';
import { pricingTable } from './theme/pricing-table.ts';
import { progress } from './theme/progress.ts';
import { prose } from './theme/prose.ts';
import { radioGroup } from './theme/radio-group.ts';
import { scrollArea } from './theme/scroll-area.ts';
import { selectMenu } from './theme/select-menu.ts';
import { select } from './theme/select.ts';
import { separator } from './theme/separator.ts';
import { sidebar } from './theme/sidebar.ts';
import { skeleton } from './theme/skeleton.ts';
import { slideover } from './theme/slideover.ts';
import { slider } from './theme/slider.ts';
import { stepper } from './theme/stepper.ts';
import { switchTheme } from './theme/switch.ts';
import { table } from './theme/table.ts';
import { tabs } from './theme/tabs.ts';
import { textarea } from './theme/textarea.ts';
import { timeline } from './theme/timeline.ts';
import { toast } from './theme/toast.ts';
import { toaster } from './theme/toaster.ts';
import { tooltip } from './theme/tooltip.ts';
import { tree } from './theme/tree.ts';
import { user } from './theme/user.ts';

export const ui = parseThemeClasses({
  accordion,
  alert,
  authForm,
  avatarGroup,
  avatar,
  badge,
  banner,
  blogPost,
  blogPosts,
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
  dashboardGroup,
  dashboardNavbar,
  dashboardPanel,
  dashboardResizeHandle,
  dashboardSearchButton,
  dashboardSearch,
  dashboardSidebarCollapse,
  dashboardSidebarToggle,
  dashboardSidebar,
  dashboardToolbar,
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
  fieldGroup,
  fileUpload,
  footerColumns,
  footer,
  formField,
  form,
  header,
  inputDate,
  inputMenu,
  inputNumber,
  inputTags,
  inputTime,
  input,
  kbd,
  link,
  listbox,
  main,
  marquee,
  modal,
  navigationMenu,
  pageAnchors,
  pageAside,
  pageBody,
  pageCard,
  pageColumns,
  pageCta,
  pageFeature,
  pageGrid,
  pageHeader,
  pageHero,
  pageLinks,
  pageList,
  pageLogos,
  pageSection,
  page,
  pagination,
  pinInput,
  popover,
  pricingPlan,
  pricingPlans,
  pricingTable,
  progress,
  prose,
  radioGroup,
  scrollArea,
  selectMenu,
  select,
  separator,
  sidebar,
  skeleton,
  slideover,
  slider,
  stepper,
  switchTheme,
  table,
  tabs,
  textarea,
  timeline,
  toast,
  toaster,
  tooltip,
  tree,
  user,
});
