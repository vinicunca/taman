import type { RouteRecordRaw } from 'vue-router';

import { describe, expect, it } from 'vitest';

import {
  generateRoutesByFrontend,
  hasAuthority,
} from '../generate-routes-frontend';

// Mock route data
const mockRoutes = [
  {
    meta: {
      authority: ['admin', 'user'],
      hideInMenu: false,
    },
    path: '/dashboard',
    children: [
      {
        path: '/dashboard/overview',
        meta: { authority: ['admin'], hideInMenu: false },
      },
      {
        path: '/dashboard/stats',
        meta: { authority: ['user'], hideInMenu: true },
      },
    ],
  },
  {
    meta: { authority: ['admin'], hideInMenu: false },
    path: '/settings',
  },
  {
    meta: { hideInMenu: false },
    path: '/profile',
  },
] as RouteRecordRaw[];

describe('hasAuthority', () => {
  it('should return true if there is no authority defined', () => {
    expect(hasAuthority(mockRoutes[2], ['admin'])).toBe(true);
  });

  it('should return true if the user has the required authority', () => {
    expect(hasAuthority(mockRoutes[0], ['admin'])).toBe(true);
  });

  it('should return false if the user does not have the required authority', () => {
    expect(hasAuthority(mockRoutes[1], ['user'])).toBe(false);
  });

  it('should call the callback and return true when it grants access', () => {
    const route = {
      meta: { authority: (roles: Array<string>) => roles.includes('admin') },
      path: '/permission-gated',
    } as unknown as RouteRecordRaw;

    expect(hasAuthority(route, ['admin'])).toBe(true);
  });

  it('should call the callback and return false when it denies access', () => {
    const route = {
      meta: { authority: (roles: Array<string>) => roles.includes('admin') },
      path: '/permission-gated',
    } as unknown as RouteRecordRaw;

    expect(hasAuthority(route, ['user'])).toBe(false);
  });
});

describe('generateRoutesByFrontend', () => {
  const forbiddenComponent = () => Promise.resolve({ default: {} });

  it('should handle routes without children', async () => {
    const generatedRoutes = await generateRoutesByFrontend(mockRoutes, [
      'user',
    ]);
    expect(generatedRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/profile', // This route has no children and should be included
        }),
      ]),
    );
  });

  it('should leave an authorized route untouched', async () => {
    const generatedRoutes = await generateRoutesByFrontend(
      mockRoutes,
      ['admin', 'user'],
      forbiddenComponent,
    );
    const dashboard = generatedRoutes.find(
      (route) => route.path === '/dashboard',
    );
    expect(dashboard?.component).toBeUndefined();
    expect(dashboard?.meta?.hideInMenu).toBe(false);
  });

  it('should never drop a route from the tree, even without access', async () => {
    const generatedRoutes = await generateRoutesByFrontend(
      mockRoutes,
      [],
      forbiddenComponent,
    );
    expect(generatedRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/dashboard' }),
        expect.objectContaining({ path: '/settings' }),
        expect.objectContaining({ path: '/profile' }),
      ]),
    );
  });

  it('should swap the component and hide an unauthorized route without menuVisibleWithForbidden', async () => {
    const generatedRoutes = await generateRoutesByFrontend(
      mockRoutes,
      [],
      forbiddenComponent,
    );
    const settings = generatedRoutes.find(
      (route) => route.path === '/settings',
    );
    expect(settings?.component).toBe(forbiddenComponent);
    expect(settings?.meta?.hideInMenu).toBe(true);
  });

  it('should swap the component but keep a menuVisibleWithForbidden route visible in the menu', async () => {
    const routesWithVisibleForbidden = [
      {
        meta: { authority: ['admin'], menuVisibleWithForbidden: true },
        path: '/reports',
      },
    ] as RouteRecordRaw[];
    const generatedRoutes = await generateRoutesByFrontend(
      routesWithVisibleForbidden,
      [],
      forbiddenComponent,
    );
    expect(generatedRoutes[0]?.component).toBe(forbiddenComponent);
    expect(generatedRoutes[0]?.meta?.hideInMenu).toBeUndefined();
  });

  it('should handle missing meta fields', async () => {
    const routesWithMissingMeta = [
      { path: '/path1' }, // No meta
      { meta: {}, path: '/path2' }, // Empty meta
      { meta: { authority: ['admin'] }, path: '/path3' }, // Only authority
    ];
    const generatedRoutes = await generateRoutesByFrontend(
      routesWithMissingMeta as RouteRecordRaw[],
      ['admin'],
    );
    expect(generatedRoutes).toEqual([
      { path: '/path1' },
      { meta: {}, path: '/path2' },
      { meta: { authority: ['admin'] }, path: '/path3' },
    ]);
  });
});
