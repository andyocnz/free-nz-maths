// Utility to resolve local NCEA resources (PDFs, images, etc.)
// from paths like "local:pastpapers/resources/91946-res-2025.pdf"
// or "local:pastpapers/resources/2025/91947/1c.webp".

const resourceModules = import.meta.glob('../pastpapers/resources/**/*.{pdf,webp,png,jpg,jpeg}', {
  eager: true
})

const resourceMap = {}

for (const [path, mod] of Object.entries(resourceModules)) {
  resourceMap[path] = mod.default || mod
}

export function resolveNceaResource(localPath) {
  if (!localPath || typeof localPath !== 'string') return null

  const prefix = 'local:'
  if (!localPath.startsWith(prefix)) return null

  const rel = localPath.slice(prefix.length)
  // Normalise to the same form Vite uses in import.meta.glob keys
  const normalised = rel.replace(/\\/g, '/').replace(/^\/+/, '')
  const key = `../${normalised}`

  return resourceMap[key] || null
}
