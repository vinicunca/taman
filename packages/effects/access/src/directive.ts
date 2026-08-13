/**
 * Global authority directive
 * Used for fine-grained control of component permissions
 * @Example v-access:role="[ROLE_NAME]" or v-access:role="ROLE_NAME"
 * @Example v-access:code="[ROLE_CODE]" or v-access:code="ROLE_CODE"
 */
import type { App, Directive, DirectiveBinding, InjectionKey, MaybeRefOrGetter } from 'vue';

import { preferences } from '@taman/preferences';
import { useAccessStore } from '@taman/stores';
import { toValue } from 'vue';

import { matchesAnyRole } from './matches-any-role';

/**
 * Roles source provided once via `registerAccessDirective`, consumed by
 * `useAccess()` (real component context, where `inject()` works). The
 * directive itself gets the same value via closure instead — `inject()`
 * does not resolve inside a directive's `mounted` hook.
 */
export const ACCESS_ROLES_KEY: InjectionKey<MaybeRefOrGetter<Array<string>>>
  = Symbol('access-roles');

function isAccessible(
  el: Element,
  binding: DirectiveBinding<string | string[]>,
  roles: Array<string>,
) {
  const accessStore = useAccessStore(); // Pinia: module-level singleton, safe outside component context

  const value = binding.value;

  if (!value) return;
  const authMethod
    = preferences.app.accessMode === 'frontend' && binding.arg === 'role'
      ? (values: Array<string>) => matchesAnyRole(roles, values)
      : (values: Array<string>) => matchesAnyRole(accessStore.accessCodes, values);

  const values = Array.isArray(value) ? value : [value];

  if (!authMethod(values)) {
    el?.remove();
  }
}

export function registerAccessDirective(
  app: App,
  roles: MaybeRefOrGetter<Array<string>>,
): void {
  const mounted = (el: Element, binding: DirectiveBinding<string | string[]>) => {
    isAccessible(el, binding, toValue(roles));
  };

  const authDirective: Directive = {
    mounted,
  };

  app.directive('access', authDirective);
  app.provide(ACCESS_ROLES_KEY, roles);
}
