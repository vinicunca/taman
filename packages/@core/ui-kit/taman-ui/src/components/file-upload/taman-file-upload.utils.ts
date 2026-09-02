export type FileUploadSlotFiles = File | Array<File> | null | undefined;

export function toFileList(files: FileUploadSlotFiles): Array<File> {
  if (files == null) {
    return [];
  }

  return Array.isArray(files) ? files : [files];
}
