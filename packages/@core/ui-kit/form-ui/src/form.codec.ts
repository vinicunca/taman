import type { CalendarDateCodecOptions } from '@taman-core/shared/utils';
import type { FormCodec, FormValues } from './form.types';
import {
  createCalendarDateCodec as createSharedCalendarDateCodec,
  createTimeCodec as createSharedTimeCodec,
} from '@taman-core/shared/utils';

export type { CalendarDateCodecOptions } from '@taman-core/shared/utils';

export type FormCodecPhase = 'decode' | 'encode';

export class FormCodecError extends Error {
  override readonly cause: unknown;
  readonly phase: FormCodecPhase;

  constructor(phase: FormCodecPhase, cause: unknown) {
    super(`[Taman Form] Failed to ${phase} form values.`);
    this.name = 'FormCodecError';
    this.cause = cause;
    this.phase = phase;
  }
}

export function decodeFormValues<
  TFormValues extends FormValues,
  TSubmitValues extends FormValues,
>(
  codec: FormCodec<TFormValues, TSubmitValues>,
  values: Readonly<TSubmitValues>,
) {
  try {
    return codec.decode(values);
  } catch (error) {
    throw new FormCodecError('decode', error);
  }
}

export function encodeFormValues<
  TFormValues extends FormValues,
  TSubmitValues extends FormValues,
>(codec: FormCodec<TFormValues, TSubmitValues>, values: Readonly<TFormValues>) {
  try {
    return codec.encode(values);
  } catch (error) {
    throw new FormCodecError('encode', error);
  }
}

export function createCalendarDateCodec(
  options?: CalendarDateCodecOptions,
): FormCodec {
  return createSharedCalendarDateCodec(options);
}

export function createTimeCodec(): FormCodec {
  return createSharedTimeCodec();
}

export function createCalendarDateTimeCodec(
  options?: CalendarDateCodecOptions,
): FormCodec {
  const calendarDate = createCalendarDateCodec(options);
  const time = createTimeCodec();

  return {
    decode: (values) => time.decode(calendarDate.decode(values)),
    encode: (values) => time.encode(calendarDate.encode(values)),
  };
}

export const calendarDateCodec: FormCodec = createCalendarDateCodec();
export const timeCodec: FormCodec = createTimeCodec();
export const calendarDateTimeCodec: FormCodec = createCalendarDateTimeCodec();
