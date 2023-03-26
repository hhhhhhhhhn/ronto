export declare function fillDependencyGraph(componentPath: string, rootDir: string): void;
export declare function renderComponent(componentPath: string, props: object, outputPath: string, dependsOn?: string[]): void;
export declare function copy(src: string, dest: string): void;
export declare function build(builder: () => void): void;
export declare function watch(builder: () => void): void;
