import type { FormRuleValidator, FormZodErrorMap } from './form.types';

const FORM_RULES = new Map<string, FormRuleValidator>();
let formZodErrorMap: FormZodErrorMap | undefined;

export function getFormRule(name: string) {
  return FORM_RULES.get(name);
}

export function registerFormRules(
  rules: Partial<Record<string, FormRuleValidator>>,
) {
  for (const [name, validator] of Object.entries(rules)) {
    if (validator) {
      FORM_RULES.set(name, validator);
    }
  }
}

export function getFormZodErrorMap() {
  return formZodErrorMap;
}

export function setFormZodErrorMap(errorMap: FormZodErrorMap | undefined) {
  formZodErrorMap = errorMap;
}
