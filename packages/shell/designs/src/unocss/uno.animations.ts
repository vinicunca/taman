export const animations = {
  keyframes: {
    'accordion-down': {
      from: { height: 0 },
      to: { height: 'var(--akar-accordion-content-height)' },
    },
    'accordion-up': {
      from: { height: 'var(--akar-accordion-content-height)' },
      to: { height: 0 },
    },
    'collapsible-down': {
      from: { height: 0 },
      to: { height: 'var(--akar-collapsible-content-height)' },
    },
    'collapsible-up': {
      from: { height: 'var(--akar-collapsible-content-height)' },
      to: { height: 0 },
    },
    'collapsible-left': {
      from: { width: 0 },
      to: { width: 'var(--akar-collapsible-content-width)' },
    },
    'collapsible-right': {
      from: { width: 'var(--akar-collapsible-content-width)' },
      to: { width: 0 },
    },

    'toast-collapsed-closed': {
      from: { transform: 'var(--transform)' },
      to: { transform: 'translateY(calc((var(--before) - var(--height)) * var(--gap))) scale(var(--scale))' },
    },
    'toast-closed': {
      from: { transform: 'var(--transform)' },
      to: { transform: 'translateY(calc((var(--offset) - var(--height)) * var(--translate-factor)))' },
    },
    'toast-pulse-a': {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '1.04' },
    },
    'toast-pulse-b': {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '1.04' },
    },

    'carousel': {
      '0%, 100%': { width: '50%' },
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(200%)' },
    },

    'carousel-rtl': {
      '0%, 100%': { width: '50%' },
      '0%': { transform: 'translateX(100%)' },
      '100%': { transform: 'translateX(-200%)' },
    },

    'carousel-vertical': {
      '0%, 100%': { height: '50%' },
      '0%': { transform: 'translateY(-100%)' },
      '100%': { transform: 'translateY(200%)' },
    },

    'carousel-inverse': {
      '0%, 100%': { width: '50%' },
      '0%': { transform: 'translateX(200%)' },
      '100%': { transform: 'translateX(-100%)' },
    },

    'carousel-inverse-rtl': {
      '0%, 100%': { width: '50%' },
      '0%': { transform: 'translateX(-200%)' },
      '100%': { transform: 'translateX(100%)' },
    },

    'carousel-inverse-vertical': {
      '0%, 100%': { height: '50%' },
      '0%': { transform: 'translateY(200%)' },
      '100%': { transform: 'translateY(-100%)' },
    },

    'swing': {
      '0%, 100%': {
        width: '50%',
        transform: 'translateX(-25%)',
      },
      '50%': { transform: 'translateX(125%)' },
    },

    'swing-vertical': {
      '0%, 100%': {
        height: '50%',
        transform: 'translateY(-25%)',
      },
      '50%': { transform: 'translateY(125%)' },
    },

    'elastic': {
      /* Firefox doesn't do "margin: 0 auto", we have to play with margin-left */
      '0%, 100%': {
        'width': '50%',
        'margin-left': '25%',
      },

      '50%': {
        'width': '90%',
        'margin-left': '5%',
      },
    },

    'elastic-vertical': {
      '0%, 100%': {
        'height': '50%',
        'margin-top': '25%',
      },

      '50%': {
        'height': '90%',
        'margin-top': '5%',
      },
    },

    'marquee': {
      from: {
        transform: 'translate3d(0, 0, 0)',
      },

      to: {
        transform: 'translate3d(calc(-100% - var(--gap)), 0, 0)',
      },
    },

    'marquee-rtl': {
      from: {
        transform: 'translate3d(0, 0, 0)',
      },

      to: {
        transform: 'translate3d(calc(100% + var(--gap)), 0, 0)',
      },
    },

    'marquee-vertical': {
      from: {
        transform: 'translate3d(0, 0, 0)',
      },

      to: {
        transform: 'translate3d(0, calc(-100% - var(--gap)), 0)',
      },
    },

    'marquee-vertical-rtl': {
      from: {
        transform: 'translate3d(0, calc(-100% - var(--gap)), 0)',
      },

      to: {
        transform: 'translate3d(0, calc(-100% * var(--gap)), 0)',
      },
    },
  },

  animation: {
    'collapsible-down': 'collapsible-down 0.2s ease-in-out',
    'collapsible-up': 'collapsible-up 0.2s ease-in-out',
    'collapsible-left': 'collapsible-left 0.2s ease-in-out',
    'collapsible-right': 'collapsible-right 0.2s ease-in-out',
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',

    'toast-collapsed-closed': 'toast-collapsed-closed 200ms ease-in-out',
    'toast-closed': 'toast-closed 200ms ease-in-out',
    'toast-pulse-a': 'toast-pulse-a 300ms ease-out',
    'toast-pulse-b': 'toast-pulse-b 300ms ease-out',

    'carousel': 'carousel 2s ease-in-out infinite',
    'carousel-rtl': 'carousel-rtl 2s ease-in-out infinite',
    'carousel-vertical': 'carousel-vertical 2s ease-in-out infinite',
    'carousel-inverse': 'carousel-inverse 2s ease-in-out infinite',
    'carousel-inverse-rtl': 'carousel-inverse-rtl 2s ease-in-out infinite',
    'carousel-inverse-vertical': 'carousel-inverse-vertical 2s ease-in-out infinite',
    'swing': 'swing 2s ease-in-out infinite',
    'swing-vertical': 'swing-vertical 2s ease-in-out infinite',
    'elastic': 'elastic 2s ease-in-out infinite',
    'elastic-vertical': 'elastic-vertical 2s ease-in-out infinite',
    'marquee': 'marquee var(--duration) linear infinite',
    'marquee-rtl': 'marquee-rtl var(--duration) linear infinite',
    'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
    'marquee-vertical-rtl': 'marquee-vertical-rtl var(--duration) linear infinite',
  },
};
