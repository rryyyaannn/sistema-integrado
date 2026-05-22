/**
 * Conventional Commits — valida toda mensagem de commit via hook commit-msg.
 * Tipos aceitos: feat, fix, chore, docs, refactor, test, build, ci, perf, revert, style.
 * @see https://www.conventionalcommits.org
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
    'body-max-line-length': [0],
  },
};
