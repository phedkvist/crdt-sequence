declare module 'automerge' {
  export function init(options?: string): object;
  export function change(doc: any, message: string, callback: void): any;
}
