/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module 'vue3-json-viewer' {
  import { AllowedComponentProps, App, Component, ComponentCustomProps, VNodeProps } from 'vue';
  interface JsonViewerProps {
    value: Object | Array<any> | string | number | boolean;
    expanded: boolean;
    expandDepth: number;
    copyable: boolean | object;
    sort: boolean;
    boxed: boolean;
    theme: string;
    previewMode: boolean;
    timeformat: (value: any) => string;
  }
  type JsonViewerType = JsonViewerProps & VNodeProps & AllowedComponentProps & ComponentCustomProps;
  const JsonViewer: Component<JsonViewerType>;
  export { JsonViewer };
  const def: { install: (app: App) => void };
  export default def;
}
declare module 'vue3-xml-viewer' {
  import { AllowedComponentProps, App, Component, ComponentCustomProps, VNodeProps } from 'vue';
  interface XmlViewerProps {
    value: Object | Array<any> | string | number | boolean;
    expanded: boolean;
    expandDepth: number;
    copyable: boolean | object;
    sort: boolean;
    boxed: boolean;
    theme: string;
    previewMode: boolean;
    timeformat: (value: any) => string;
  }
  type XmlViewerType = XmlViewerProps & VNodeProps & AllowedComponentProps & ComponentCustomProps;
  const XmlViewer: Component<XmlViewerType>;
  export { XmlViewer };
  const def: { install: (app: App) => void };
  export default def;
}