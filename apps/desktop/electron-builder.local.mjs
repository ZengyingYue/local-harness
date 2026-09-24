/** Independent Ubuntu/Windows distribution, without an upstream update feed or signing identity. */
import { resolveDesktopTargetBuildPaths, resolveDesktopBuildTarget, desktopTargetPlatform } from './scripts/desktop-build-paths.mjs'
import { join, relative, sep } from 'node:path'
import { officePackageDirectories } from '../../scripts/libreoffice-packages.mjs'

const paths = resolveDesktopTargetBuildPaths()
export default {
  appId: 'io.local-harness.desktop',
  productName: 'Local Harness',
  artifactName: 'local-harness-${version}-${os}-${arch}.${ext}',
  extraMetadata: { name: 'local-harness', desktopName: 'local-harness.desktop', homepage: 'https://github.com/ZengyingYue/local-harness', dshDesktopAppId: 'io.local-harness.desktop' },
  directories: { output: join(paths.root, 'local-artifacts') },
  electronDist: paths.electron,
  electronFuses: { runAsNode: true },
  asar: true,
  asarUnpack: ['**/*.{node,dylib,dll,so,exe}', '**/*.so.*', '**/spawn-helper', '**/@vscode/ripgrep-*/bin/rg', '**/@deepseek-ai/libreoffice-kit-*/**/*'],
  files: ['lib/main.js', 'lib/welcome/**/*', 'lib/preload-*.cjs', 'renderer/**/*', 'package.json',
    { from: paths.dsh, to: 'dsh', filter: ['**/*'] },
    { from: join(paths.dsh, 'node_modules'), to: 'dsh/node_modules', filter: ['**/*'] }],
  extraResources: [{ from: paths.runtime, to: 'runtime' }, { from: 'resources/icon-windows.png', to: 'icon.png' }],
  linux: { target: ['AppImage', 'deb'], syncDesktopName: true, category: 'Development', executableName: 'local-harness', icon: 'resources/icon-windows.png', maintainer: 'Local Harness contributors' },
  win: { target: ['nsis'], icon: 'resources/icon-windows.png', signExecutable: false },
  nsis: { oneClick: false, perMachine: false, allowToChangeInstallationDirectory: true, deleteAppDataOnUninstall: false },
  beforePack: async context => {
    const directories = await officePackageDirectories(paths.dsh, desktopTargetPlatform(resolveDesktopBuildTarget()))
    context.packager.config.asarUnpack.push(...directories.map(directory =>
      `**/${relative(paths.dsh, directory).split(sep).join('/')}/**/*`))
  },
  publish: null,
}
