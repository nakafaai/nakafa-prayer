import { Option } from 'effect'
import { useId, type ReactNode } from 'react'
import { LANGUAGE_IDS, MADHAB_NAMES, MESSAGES, METHOD_NAMES } from '@/lib/i18n'
import { CALCULATION_METHOD_IDS, MADHAB_IDS } from '@/lib/prayer'
import {
  decodeCalculationMethod,
  decodeLanguage,
  decodeMadhab,
  decodeTimeFormat,
  decodeTheme,
  THEME_PREFERENCES,
  TIME_FORMATS,
  type ThemePreference,
  type TimeFormat,
} from '@/lib/settings-schema'
import { LocationPicker } from './location-picker'
import { usePrayerSchedule } from './prayer-context'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet'
import { SegmentedControl, SegmentedControlItem } from './ui/segmented-control'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

function Field({
  label,
  children,
}: {
  label: string
  children: (labelId: string) => ReactNode
}) {
  const labelId = useId()

  return (
    <div className="grid gap-2">
      <span id={labelId} className="text-[13px] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children(labelId)}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-5">
      <h3 className="text-[13px] font-semibold tracking-tight">{title}</h3>
      {children}
    </section>
  )
}

/**
 * Applies a control's value through the schema that owns the setting.
 *
 * Radix reports a bare `string` for a select and an empty string when a
 * segmented control is cleared, so the value is decoded before it reaches
 * state and anything off-menu is dropped instead of being asserted in.
 */
function settingChange<A>(
  decode: (value: unknown) => Option.Option<A>,
  apply: (value: A) => void,
) {
  return (value: string) => {
    const decoded = decode(value)

    if (Option.isSome(decoded)) {
      apply(decoded.value)
    }
  }
}

/** Everything the site can be configured with, in one controlled sheet. */
export function SettingsSheet({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { state, actions } = usePrayerSchedule()
  const t = MESSAGES[state.settings.language]
  const { language, calculationMethod, madhab, timeFormat } = state.settings

  const themeLabels: Record<ThemePreference, string> = {
    system: t.themeSystem,
    light: t.themeLight,
    dark: t.themeDark,
  }

  const timeFormatLabels: Record<TimeFormat, string> = {
    system: t.timeFormatSystem,
    h12: t.timeFormat12,
    h24: t.timeFormat24,
  }

  return (
    <Sheet
      open={opened}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <SheetContent closeLabel={t.close}>
        <SheetHeader>
          <SheetTitle>{t.settingsTitle}</SheetTitle>
          <SheetDescription>{t.settingsHint}</SheetDescription>
        </SheetHeader>

        <SheetBody>
          <div className="grid gap-7">
            <Section title={t.location}>
              <LocationPicker />
            </Section>

            <Section title={t.calculation}>
              <Field label={t.calculationMethod}>
                {(labelId) => (
                  <Select
                    value={calculationMethod}
                    onValueChange={settingChange(decodeCalculationMethod, (value) =>
                      actions.update({ calculationMethod: value }),
                    )}
                  >
                    <SelectTrigger aria-labelledby={labelId}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CALCULATION_METHOD_IDS.map((id) => (
                        <SelectItem key={id} value={id}>
                          {METHOD_NAMES[language][id]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>

              <Field label={t.asrSchool}>
                {(labelId) => (
                  <Select
                    value={madhab}
                    onValueChange={settingChange(decodeMadhab, (value) =>
                      actions.update({ madhab: value }),
                    )}
                  >
                    <SelectTrigger aria-labelledby={labelId}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MADHAB_IDS.map((id) => (
                        <SelectItem key={id} value={id}>
                          {MADHAB_NAMES[language][id]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
            </Section>

            <Section title={t.display}>
              <Field label={t.appearance}>
                {(labelId) => (
                  <SegmentedControl
                    type="single"
                    value={state.theme}
                    aria-labelledby={labelId}
                    onValueChange={settingChange(decodeTheme, actions.setTheme)}
                  >
                    {THEME_PREFERENCES.map((value) => (
                      <SegmentedControlItem key={value} value={value}>
                        {themeLabels[value]}
                      </SegmentedControlItem>
                    ))}
                  </SegmentedControl>
                )}
              </Field>

              <Field label={t.language}>
                {(labelId) => (
                  <SegmentedControl
                    type="single"
                    value={language}
                    aria-labelledby={labelId}
                    onValueChange={settingChange(decodeLanguage, (value) =>
                      actions.update({ language: value }),
                    )}
                  >
                    {LANGUAGE_IDS.map((value) => (
                      <SegmentedControlItem key={value} value={value}>
                        {value === 'en' ? 'English' : 'Indonesia'}
                      </SegmentedControlItem>
                    ))}
                  </SegmentedControl>
                )}
              </Field>

              <Field label={t.timeFormat}>
                {(labelId) => (
                  <SegmentedControl
                    type="single"
                    value={timeFormat}
                    aria-labelledby={labelId}
                    onValueChange={settingChange(decodeTimeFormat, (value) =>
                      actions.update({ timeFormat: value }),
                    )}
                  >
                    {TIME_FORMATS.map((value) => (
                      <SegmentedControlItem key={value} value={value}>
                        {timeFormatLabels[value]}
                      </SegmentedControlItem>
                    ))}
                  </SegmentedControl>
                )}
              </Field>
            </Section>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
