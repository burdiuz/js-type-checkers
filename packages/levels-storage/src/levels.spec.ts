import { describe, it, expect, afterEach } from '@jest/globals';
import {
  REPORT_FIRST_TYPE_ONLY,
  REPORT_NEVER,
  REPORT_ALL_ASSIGNED_TYPES,
  getGlobalReportingLevel,
  getReportingLevel,
  setGlobalReportingLevel,
  setReportingLevel,
  validateReportingLevel,
} from './levels';

describe('validateReportingLevel', () => {
  it('returns REPORT_NEVER for REPORT_NEVER', () => {
    expect(validateReportingLevel(REPORT_NEVER)).toBe(REPORT_NEVER);
  });

  it('returns REPORT_ALL_ASSIGNED_TYPES for REPORT_ALL_ASSIGNED_TYPES', () => {
    expect(validateReportingLevel(REPORT_ALL_ASSIGNED_TYPES)).toBe(REPORT_ALL_ASSIGNED_TYPES);
  });

  it('returns REPORT_FIRST_TYPE_ONLY for REPORT_FIRST_TYPE_ONLY', () => {
    expect(validateReportingLevel(REPORT_FIRST_TYPE_ONLY)).toBe(REPORT_FIRST_TYPE_ONLY);
  });

  it('returns REPORT_FIRST_TYPE_ONLY for unknown values', () => {
    expect(validateReportingLevel('unknown')).toBe(REPORT_FIRST_TYPE_ONLY);
    expect(validateReportingLevel(null)).toBe(REPORT_FIRST_TYPE_ONLY);
    expect(validateReportingLevel(undefined)).toBe(REPORT_FIRST_TYPE_ONLY);
    expect(validateReportingLevel(42)).toBe(REPORT_FIRST_TYPE_ONLY);
  });
});

describe('global reporting level', () => {
  afterEach(() => {
    setGlobalReportingLevel(REPORT_FIRST_TYPE_ONLY);
  });

  it('defaults to REPORT_FIRST_TYPE_ONLY', () => {
    expect(getGlobalReportingLevel()).toBe(REPORT_FIRST_TYPE_ONLY);
  });

  it('updates when set', () => {
    setGlobalReportingLevel(REPORT_NEVER);
    expect(getGlobalReportingLevel()).toBe(REPORT_NEVER);

    setGlobalReportingLevel(REPORT_ALL_ASSIGNED_TYPES);
    expect(getGlobalReportingLevel()).toBe(REPORT_ALL_ASSIGNED_TYPES);
  });

  it('validates level on set (invalid level maps to REPORT_FIRST_TYPE_ONLY)', () => {
    setGlobalReportingLevel('invalid' as never);
    expect(getGlobalReportingLevel()).toBe(REPORT_FIRST_TYPE_ONLY);
  });
});

describe('getReportingLevel', () => {
  afterEach(() => {
    setGlobalReportingLevel(REPORT_FIRST_TYPE_ONLY);
  });

  it('falls back to global level when target has no override', () => {
    const target = {};
    setGlobalReportingLevel(REPORT_ALL_ASSIGNED_TYPES);
    expect(getReportingLevel(target, 'prop')).toBe(REPORT_ALL_ASSIGNED_TYPES);
  });

  it('returns object-level override', () => {
    const target = {};
    setReportingLevel(target, REPORT_NEVER);
    expect(getReportingLevel(target, 'prop')).toBe(REPORT_NEVER);
  });

  it('returns property-level override', () => {
    const target = {};
    setReportingLevel(target, REPORT_NEVER, { prop: REPORT_ALL_ASSIGNED_TYPES });
    expect(getReportingLevel(target, 'prop')).toBe(REPORT_ALL_ASSIGNED_TYPES);
  });

  it('property-level override takes priority over object-level', () => {
    const target = {};
    setReportingLevel(target, REPORT_FIRST_TYPE_ONLY, { prop: REPORT_NEVER });
    expect(getReportingLevel(target, 'prop')).toBe(REPORT_NEVER);
    expect(getReportingLevel(target, 'other')).toBe(REPORT_FIRST_TYPE_ONLY);
  });

  it('resolves level from constructor when not on instance', () => {
    class MyClass {}
    setReportingLevel(MyClass, REPORT_ALL_ASSIGNED_TYPES);
    const instance = new MyClass();
    expect(getReportingLevel(instance, 'prop')).toBe(REPORT_ALL_ASSIGNED_TYPES);
  });

  it('instance-level override takes priority over constructor-level', () => {
    class MyClass {}
    setReportingLevel(MyClass, REPORT_ALL_ASSIGNED_TYPES);
    const instance = new MyClass();
    setReportingLevel(instance, REPORT_NEVER);
    expect(getReportingLevel(instance, 'prop')).toBe(REPORT_NEVER);
  });
});

describe('setReportingLevel', () => {
  it('sets a general level on target', () => {
    const target = {};
    setReportingLevel(target, REPORT_NEVER);
    expect(getReportingLevel(target, 'any')).toBe(REPORT_NEVER);
  });

  it('clears the general level when passed undefined', () => {
    const target = {};
    setReportingLevel(target, REPORT_NEVER);
    setReportingLevel(target, undefined);
    setGlobalReportingLevel(REPORT_ALL_ASSIGNED_TYPES);
    expect(getReportingLevel(target, 'any')).toBe(REPORT_ALL_ASSIGNED_TYPES);
  });

  it('sets per-property levels', () => {
    const target = {};
    setReportingLevel(target, undefined, { x: REPORT_NEVER, y: REPORT_ALL_ASSIGNED_TYPES });
    expect(getReportingLevel(target, 'x')).toBe(REPORT_NEVER);
    expect(getReportingLevel(target, 'y')).toBe(REPORT_ALL_ASSIGNED_TYPES);
  });

  it('clears per-property levels when passed undefined', () => {
    const target = {};
    setReportingLevel(target, REPORT_FIRST_TYPE_ONLY, { x: REPORT_NEVER });
    setReportingLevel(target, REPORT_FIRST_TYPE_ONLY, undefined);
    expect(getReportingLevel(target, 'x')).toBe(REPORT_FIRST_TYPE_ONLY);
  });

  it('validates per-property levels (invalid maps to REPORT_FIRST_TYPE_ONLY)', () => {
    const target = {};
    setReportingLevel(target, undefined, { x: 'bad' as never });
    expect(getReportingLevel(target, 'x')).toBe(REPORT_FIRST_TYPE_ONLY);
  });

  it('does not throw when target has no PROPERTY_REPORT_KEY set', () => {
    const target = {};
    expect(() => getReportingLevel(target, 'anything')).not.toThrow();
  });
});
