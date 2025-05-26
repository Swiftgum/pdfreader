declare module "*.pdf" {
  const content: string;
  export default content;
}

declare module "*.pdf?url" {
  const content: string;
  export default content;
} 