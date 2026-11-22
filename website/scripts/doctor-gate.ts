import { NodeRuntime, NodeServices } from '@effect/platform-node'
import { Array as Arr, Effect, Schema, Stream } from 'effect'
import { ChildProcess } from 'effect/process'

const REACT_DOCTOR_VERSION = 'react-doctor@0.9.23'

const DiagnosticSchema = Schema.Struct({
  filePath: Schema.String,
  line: Schema.Finite,
  message: Schema.String,
  rule: Schema.String,
})

const ReportSchema = Schema.Struct({
  diagnostics: Schema.optionalKey(Schema.Array(DiagnosticSchema)),
  summary: Schema.Struct({
    errorCount: Schema.Finite,
    score: Schema.Finite,
    totalDiagnosticCount: Schema.Finite,
    warningCount: Schema.Finite,
  }),
})

const decodeReport = Schema.decodeUnknownEffect(Schema.fromJsonString(ReportSchema))

/** Typed failure when React Doctor exits with a non-zero code or reports findings. */
export class DoctorGateError extends Schema.TaggedError<
  DoctorGateError,
  { readonly brand: unique symbol }
>()('DoctorGateError', {
  message: Schema.String,
}) {}

/**
 * Runs React Doctor against the website and fails unless the score is 100 with
 * zero findings.
 */
const runDoctorGate = Effect.fn('doctorGate.run')(function* () {
  const [exitCode, stdout] = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(
        'bunx',
        [REACT_DOCTOR_VERSION, '.', '--yes', '--json'],
        { stderr: 'inherit', stdin: 'ignore' },
      )
      return yield* Effect.all(
        [handle.exitCode, handle.stdout.pipe(Stream.decodeText(), Stream.mkString)],
        { concurrency: 2 },
      )
    }),
  ).pipe(
    Effect.mapError(
      (cause) =>
        new DoctorGateError({
          message: `React Doctor did not start: ${cause.message}`,
        }),
    ),
  )

  if (exitCode !== 0) {
    return yield* new DoctorGateError({
      message: `React Doctor exited with code ${exitCode}.`,
    })
  }

  const report = yield* decodeReport(stdout).pipe(
    Effect.mapError(
      () =>
        new DoctorGateError({
          message: 'React Doctor output did not match the report schema.',
        }),
    ),
  )

  const { errorCount, score, totalDiagnosticCount, warningCount } = report.summary
  yield* Effect.log(
    `React Doctor score ${score} / 100 (${errorCount} errors, ${warningCount} warnings)`,
  )

  if (score !== 100 || totalDiagnosticCount !== 0) {
    const details = Arr.map(
      report.diagnostics ?? [],
      (diagnostic) =>
        `- ${diagnostic.rule} at ${diagnostic.filePath}:${diagnostic.line}\n  ${diagnostic.message}`,
    )
    return yield* new DoctorGateError({
      message: Arr.join(
        [...details, 'React Doctor must report 100 with no findings.'],
        '\n',
      ),
    })
  }
})

NodeRuntime.runMain(runDoctorGate().pipe(Effect.provide(NodeServices.layer)))
