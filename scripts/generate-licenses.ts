import * as checker from 'license-checker-rseidelsohn'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()

checker.init(
  {
    start: projectRoot,
    production: true,
    customFormat: {
      name: '',
      version: '',
      author: '',
      repository: '',
      source: '',
      license: '',
      licenseText: '',
    },
  },
  (err, packages) => {
    if (err) {
      console.error('Error:', err)
      process.exit(1)
    }

    const licenses = Object.entries(packages).map(([name, info]) => {
      const [packageName, version] = name.split('@').filter(Boolean)
      const fullName = name.startsWith('@') ? `@${packageName}` : packageName
      const actualVersion = name.startsWith('@') ? version : name.split('@')[1]

      return {
        name: fullName,
        version: actualVersion || (info as any).version || 'unknown',
        author: (info as any).publisher || (info as any).author || null,
        repository: (info as any).repository || '',
        source: `https://registry.npmjs.org/${fullName}/-/${fullName.replace('@', '').replace('/', '-')}-${actualVersion || 'unknown'}.tgz`,
        license: (info as any).licenses || 'unknown',
        licenseText: (info as any).licenseText || '',
      }
    })

    const outputPath = path.join(projectRoot, 'licenses.json')
    fs.writeFileSync(outputPath, JSON.stringify(licenses, null, 2))
    console.log(`Generated licenses.json with ${licenses.length} packages`)
  }
)
