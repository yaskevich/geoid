import type { MenuOption } from 'naive-ui';

declare global {
  interface keyable {
    [key: string]: any;
  }

  interface IUser {
    firstname: string;
    lastname: string;
  }

  interface IStats {
    annotations: number;
    annotated: number;
    images: number;
    messages: { all: number; images: number; dups: number };
    features: Array<string>;
    tree: keyable;
  }

  interface ILog {
    user_id: number;
    country: string;
    address: string;
    created: string;
  }

  interface IFeature {
    id: number;
    code: string;
    value?: boolean | string | number;
    title: string;
    note?: string;
    parent: number;
    type: string | null;
    comment: string;
    children?: Array<IFeature>;
    ref?: IFeature;
    checked?: boolean;
    deleted?:boolean;
  }

  interface IAnnotation {
    id: string;
    type: string;
    content: string;
    eid?: number;
    data_id: number;
    orient: number;
    country: string;
    properties: Array<IFeature>;
    features: Array<IFeature>;
  }

  interface IMessage {
    id: number;
    eid: number;
    orient: number;
    country: string;
    next?: number;
    prev?: number;
    url: string;
    src: string;
    created: string;
    imagepath: string;
    annotated: string;
    features: Array<IFeature>;
    geonote: string;
    note: string;
    data: {
      // Telegram
      message: string;
      grouped_id: string;
      from_id: { user_id: string };
      fwd_from: { from_id: { channel_id: number }; channel_post: string; date: string; user_id: string };
      date: string;
      views: string;
      _: string;
      // alternative
      title?: string;
      user: number;
      meta: {
        Image: {
          DateTime: string;
        };
        image: {
          ModifyDate: string;
        };
        gps: Object;
        exif: Object;
      };
      geo: Object;
    };
  }

  interface IUser {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    sex: number;
    server: string;
    commit: string;
    unix: number;
    privs: number;
    activated: boolean;
    requested: Date;
    text_id: number;
    token?: string;
    note?: string;
    dir: string;
    settings: {
      map_mapbox_key: string;
      map_mapbox: boolean;
      map_vector: boolean;
      map_style: string;
      map_tile: string;
      title: string;
    };
  }

  interface IChat {
    src: string;
    type: string;
    firstname: string;
    lastname: string;
    title: string;
    eid: number;
  }

  interface IUsersDict {
    [id: string]: IUser;
  }

  interface IObject {
    id: number;
    data_id: number;
    content: string;
    eid?: number;
    properties: Array<IFeature>;
    features: Array<IFeature>;
    geometry: string;
    shape: string;
    renderedvia: Object;
    image?: string;
  }

  interface IState {
    token?: string;
    title: string;
    error?: string;
    user?: IUser;
    nav: {
      options: Array<MenuOption>;
      key: string;
    };
    selection: {
      images: keyable;
      objects: keyable;
      mode: boolean;
    };
  }

  interface ISettings {
    registration_open: boolean;
  }
}
