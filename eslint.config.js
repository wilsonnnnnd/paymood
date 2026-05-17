import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    ignores: ['.next/**', 'node_modules/**', '.aidw/**', '.trae/**'],
  },
  nextPlugin.configs['core-web-vitals'],
]
