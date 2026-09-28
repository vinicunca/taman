import type { FileUploadProps } from 'pohon-ui';

export interface TamanFileUploadProps<Multiple extends boolean = false> extends FileUploadProps<Multiple> {
  label?: string;
  labelActions?: string;
  labelPreview?: string;
  labelAddMore?: string;
}
