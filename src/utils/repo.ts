interface Repository {
  provider: string
  owner: string;
  repo: string;
  name: string;
  url: string
}

/**
 * Parse a github repo or url
 * @param nameOrURL URL or name of a GitHub repository
 * @returns Object containing name and owner, or false if the input is invalid
 */
export function repoName(nameOrURL: string): Repository | false {
  const match = (/(?:https\:\/\/((?:[^\.\/]\.?){2,})\/)?([^\/]+)\/([^\/\.]+)(?:\.git)?/i).exec(nameOrURL);
  if (!match) return false;
  return {
    provider: match[1] || 'github.com',
    owner: match[2],
    repo: match[3],
    name: match[2] + '/' + match[3],
    url: `https://${match[1] || 'github.com'}/${match[2]}/${match[3]}`
  }
}