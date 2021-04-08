export interface InertConfig {
  custom: { [key: string]: any };
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
    slashPipeline: ((config: InertConfig, file: any, previous: any) => any)[];

    folders: {
      folder: string;
      build: {
        traverseLevel: 'flat' | 'rescursive';
        filePipeline: ((config: InertConfig, file: any, previous: any) => any)[];
      }
    }[];
  };
}