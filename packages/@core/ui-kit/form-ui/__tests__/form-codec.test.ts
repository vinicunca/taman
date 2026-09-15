import type { FormCodec } from '../src/form.types';

import { decodeCalendarDateValues } from '@taman-core/shared/utils';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { FormApi } from '../src/form.api';
import {
  calendarDateCodec,
  decodeFormValues,
  encodeFormValues,
  FormCodecError,
} from '../src/form.codec';

interface FilterFormValues {
  period: [number, number];
  tags: Array<string>;
}

interface FilterSubmitValues {
  endTime: number;
  startTime: number;
  tags: string;
}

const filterCodec: FormCodec<FilterFormValues, FilterSubmitValues> = {
  decode(values) {
    return {
      period: [values.startTime, values.endTime],
      tags: values.tags ? values.tags.split(',') : [],
    };
  },
  encode(values) {
    return {
      endTime: values.period[1],
      startTime: values.period[0],
      tags: values.tags.join(','),
    };
  },
};

describe('form codec', () => {
  it('encodes and decodes complete form values', () => {
    const submitValues = encodeFormValues(filterCodec, {
      period: [1, 2],
      tags: ['admin', 'user'],
    });

    expect(submitValues).toEqual({
      endTime: 2,
      startTime: 1,
      tags: 'admin,user',
    });
    expect(decodeFormValues(filterCodec, submitValues)).toEqual({
      period: [1, 2],
      tags: ['admin', 'user'],
    });
    expectTypeOf(submitValues).toEqualTypeOf<FilterSubmitValues>();
  });

  it('reports the failed codec phase without mutating inputs', () => {
    const values = Object.freeze({ period: [1, 2], tags: ['admin'] }) as {
      period: [number, number];
      tags: Array<string>;
    };
    const codec: FormCodec<FilterFormValues, FilterSubmitValues> = {
      decode: filterCodec.decode,
      encode() {
        throw new Error('broken encoder');
      },
    };

    expect(() => encodeFormValues(codec, values)).toThrowError(FormCodecError);

    let codecError: unknown;
    try {
      encodeFormValues(codec, values);
    } catch (error) {
      codecError = error;
    }
    expect(codecError).toBeInstanceOf(FormCodecError);
    expect(codecError).toMatchObject({ phase: 'encode' });
    expect(values).toEqual({ period: [1, 2], tags: ['admin'] });
  });
});

describe('calendarDateCodec', () => {
  const utcIso = '2022-02-03T00:00:00.000Z';
  const { date } = decodeCalendarDateValues({ date: utcIso });

  it('encodes live CalendarDate form values to UTC ISO strings', async () => {
    const formApi = new FormApi({
      codec: calendarDateCodec,
    });
    const formActions: any = {
      meta: {},
      values: { date },
    };

    formApi.mount(formActions, new Map());

    expect(await formApi.getValues()).toEqual({ date: utcIso });
    expect(formActions.values.date).toBe(date);
  });

  it('decodes UTC ISO strings into CalendarDate form values', async () => {
    const setValues = vi.fn();
    const formApi = new FormApi({
      codec: calendarDateCodec,
    });
    const formActions: any = {
      meta: {},
      setValues,
      values: {},
    };

    await formApi.mount(formActions, new Map());
    await formApi.setSubmitValues({ date: utcIso }, false);

    expect(setValues).toHaveBeenCalledWith({ date }, false);
  });

  it('submits encoded ISO dates without cloning live CalendarDate values', async () => {
    const handleSubmit = vi.fn();
    const formApi = new FormApi({
      codec: calendarDateCodec,
      handleSubmit,
    });
    const formActions: any = {
      meta: {},
      submit: vi.fn().mockResolvedValue(true),
      values: { date, name: 'Ada' },
    };

    await formApi.mount(formActions, new Map());
    const result = await formApi.submit();

    expect(result).toEqual({ date: utcIso, name: 'Ada' });
    expect(handleSubmit).toHaveBeenCalledWith(
      { date: utcIso, name: 'Ada' },
      { date, name: 'Ada' },
    );
    expect(handleSubmit.mock.calls[0]?.[1]?.date).toBe(date);
    expect(formActions.values.date).toBe(date);
  });
});
