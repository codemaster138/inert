export interface InertConfig {
  custom?: { [key: string]: any };
  build: {
    globals: any[];

    templates: {
      [key: string]: string;
    };

    sourceDirs: {
      [key: string]: string;
    };

    outDirs: {
      [key: string]: string;
    };

    rootFile: string;
    slashPipeline: ((config: InertConfig, file: InertFile, previous: any) => any)[];

    folders: {
      folder: string;
      build: {
        traverseLevel: 'flat' | 'recursive';
        filePipeline: ((config: InertConfig, file: InertFile, previous: any) => any)[];
      }
    }[];
  };
}

export interface InertFile {
  /**
   * Path to file, may be absolute or relative
   */
  path: string;
  /**
   * File extension (if any) *with* period
   */
  extension: string;
  /**
   * File name without path, but with extension (if any), such as 'index.js'
   */
  basename: string;
  /**
   * File name without extension
   */
  withoutExtension: string;
  /**
   * Path to containing directory, may be absolute or relative
   */
  dirname: string;
  relative: string;
}