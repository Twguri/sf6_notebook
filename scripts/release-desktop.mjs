import { $ } from "zx"

const version = process.argv[2]

if (!version) {
  console.log("Usage: npm run deploy:desktop 1.2.4")
  process.exit(1)
}

await $`git add .`
await $`git commit -m "release v${version}"`
await $`git tag v${version}`
await $`git push`
await $`git push origin v${version}`

console.log(`Release v${version} triggered`)