/** Verify the installed Local Harness runtime, native tools, and real Host boot. */
import { cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { desktopTargetPlatform, resolveDesktopBuildTarget, resolveDesktopTargetBuildPaths } from './desktop-build-paths.mjs'
import { readDesktopRuntime, verifyDesktopRuntime } from '../src/runtime-tree.ts'
import { smokePreparedRuntime } from './smoke-prepared-runtime.ts'

const paths = resolveDesktopTargetBuildPaths()
const target = desktopTargetPlatform(resolveDesktopBuildTarget())
if (target.platform !== 'linux' && target.platform !== 'win32') throw new Error('Local Harness smoke requires Linux or Windows.')
const directory = target.platform === 'win32' ? 'win-unpacked' : target.arch === 'arm64' ? 'linux-arm64-unpacked' : 'linux-unpacked'
const packaged = join(paths.root, 'local-artifacts', directory)
const installation = target.platform === 'win32' ? await mkdtemp(join(tmpdir(), 'Local Harness-')) : undefined
try {
  // Native Office helpers must run from installation-sized paths; the nested
  // repository build tree adds directories absent from a normal installation.
  if (installation !== undefined) await cp(packaged, installation, { recursive: true, force: false, errorOnExist: true })
  const app = installation ?? packaged
  const resources = join(app, 'resources')
  const executable = join(app, target.platform === 'win32' ? 'Local Harness.exe' : 'local-harness')
  const descriptor = await verifyDesktopRuntime(paths.dsh, readDesktopRuntime(paths.dsh).release.version, target)
  await smokePreparedRuntime(join(resources, 'app.asar', 'dsh'), executable, join(resources, 'runtime'), descriptor)
} finally {
  if (installation !== undefined) await rm(installation, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
