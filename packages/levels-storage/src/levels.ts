/** Disable type tracking entirely for this target/property. */
export const REPORT_NEVER = 'never' as const;
/** Track every type ever assigned — each new type triggers a violation report once. */
export const REPORT_ALL_ASSIGNED_TYPES = 'all' as const;
/** Track only the first observed type — every subsequent type mismatch triggers a report. */
export const REPORT_FIRST_TYPE_ONLY = 'first' as const;

export type ReportingLevel = typeof REPORT_NEVER | typeof REPORT_ALL_ASSIGNED_TYPES | typeof REPORT_FIRST_TYPE_ONLY;

type PerPropertyLevels = Record<string, ReportingLevel>;

// Symbol keys are used instead of string keys to avoid colliding with user-defined properties.
const REPORT_KEY: unique symbol = Symbol('type-checkers:report-level');
const PROPERTY_REPORT_KEY: unique symbol = Symbol('type-checkers:property-report-level');

interface TargetWithLevels {
  [REPORT_KEY]?: ReportingLevel;
  [PROPERTY_REPORT_KEY]?: PerPropertyLevels;
  constructor: TargetWithLevels;
}

let globalReportingLevel: ReportingLevel = REPORT_FIRST_TYPE_ONLY;

export const validateReportingLevel = (level: unknown): ReportingLevel => {
  switch (level) {
    case REPORT_NEVER:
    case REPORT_ALL_ASSIGNED_TYPES:
      return level;
    default:
      return REPORT_FIRST_TYPE_ONLY;
  }
};

export const setGlobalReportingLevel = (level: ReportingLevel): void => {
  globalReportingLevel = validateReportingLevel(level);
};

export const getGlobalReportingLevel = (): ReportingLevel => globalReportingLevel;

const setTargetGeneralReportingLevel = (target: TargetWithLevels, level: ReportingLevel | undefined): void => {
  if (level) {
    target[REPORT_KEY] = validateReportingLevel(level);
  } else {
    delete target[REPORT_KEY];
  }
};

const setTargetPropertyReportingLevel = (
  target: TargetWithLevels,
  perPropertyLevels: PerPropertyLevels | undefined
): void => {
  if (!perPropertyLevels) {
    delete target[PROPERTY_REPORT_KEY];
    return;
  }

  target[PROPERTY_REPORT_KEY] = Object.keys(perPropertyLevels).reduce<PerPropertyLevels>((levels, prop) => {
    levels[prop] = validateReportingLevel(perPropertyLevels[prop]);
    return levels;
  }, {});
};

export const setReportingLevel = (
  target: object,
  generalLevel: ReportingLevel | undefined,
  perPropertyLevels?: PerPropertyLevels
): void => {
  setTargetGeneralReportingLevel(target as TargetWithLevels, generalLevel);
  setTargetPropertyReportingLevel(target as TargetWithLevels, perPropertyLevels);
};

const getTargetReportingLevel = (target: TargetWithLevels, key: PropertyKey): ReportingLevel | undefined => {
  const perPropLevels = target[PROPERTY_REPORT_KEY];
  if (perPropLevels && Object.hasOwn(perPropLevels, key)) {
    return perPropLevels[key as string];
  }
  return target[REPORT_KEY];
};

/**
 * Resolve the reporting level for a property on a target object.
 * Priority (highest to lowest): per-property on instance → object-level on instance
 * → per-property on constructor → object-level on constructor → global default.
 */
export const getReportingLevel = (target: object, key: PropertyKey): ReportingLevel => {
  const t = target as TargetWithLevels;
  let level = getTargetReportingLevel(t, key);

  if (!level) {
    level = getTargetReportingLevel(t.constructor as TargetWithLevels, key);
  }

  return level ?? getGlobalReportingLevel();
};
