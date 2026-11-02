---
'@vinicunca/taman-core': patch
'@vinicunca/taman-ui': patch
---

Hide dialogs and drawers on inactive cached pages while preserving their open state and drafts. Restore them without repeating opening callbacks, and release their interaction layers while inactive.

Keep scrolling locked until the last overlay closes and restore original scrollbar compensation styles. Settle every concurrent StateHandler waiter, including rejecting pending waiters when reset.
