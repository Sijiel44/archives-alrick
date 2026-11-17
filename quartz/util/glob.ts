import path from "path"
import { FilePath } from "./path"
import { globby } from "globby"

export function toPosixPath(fp: string): string {
  return fp.split(path.sep).join("/")
}

export async function glob(
  pattern: string,
  cwd: string,
  ignorePatterns: string[],
): Promise<FilePath[]> {
  const fps = (
    await globby(pattern, {
      cwd,
      ignore: ignorePatterns,
      // Le profil Archives lit un répertoire généré par sa liste de sources,
      // volontairement ignoré par Git pour ne jamais commiter le build.
      gitignore: process.env.PUBLICATION_PROFILE !== "orin-campaign",
    })
  ).map(toPosixPath)
  return fps as FilePath[]
}
