import checksum from "checksum";

export function asyncChecksum(file: string) {
  return new Promise<string>((resolve, reject) => {
    checksum.file(file, (err, sum) => {
      if (err) reject(err);
      resolve(sum);
    });
  });
}