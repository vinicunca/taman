import type { UserConfig } from '@commitlint/types';

export interface DefineConfigOptions {
  /**
   * Directory used to discover package names for the scope rule.
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * Non-package scopes. Package names (full and unscoped short form) are
   * always allowed.
   * @default ['project', 'style', 'lint', 'ci', 'dev', 'deploy', 'other']
   */
  scopes?: Array<string>;
}

export declare function defineConfig(options?: DefineConfigOptions): UserConfig;

declare const userConfig: UserConfig;

export default userConfig;
