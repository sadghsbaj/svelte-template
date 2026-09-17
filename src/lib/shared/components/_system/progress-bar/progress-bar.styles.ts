/**
 * ProgressBar shares visual track and fill primitives with Meter to maintain strict
 * design consistency across scalar measurements and dynamic progress indicators.
 * While Meter denotes scalar values within a known range (role="meter"),
 * ProgressBar represents ongoing background tasks or multi-step operations (role="progressbar")
 * with full support for both determinate and indeterminate states.
 */
export {
    meterFillStyles as progressBarFillStyles,
    meterTrackStyles as progressBarTrackStyles,
    type MeterFillStyleProps as ProgressBarFillStyleProps,
    type MeterTrackStyleProps as ProgressBarTrackStyleProps,
} from "$components/_system/meter/meter.styles";
