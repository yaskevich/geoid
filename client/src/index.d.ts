import type { MenuOption } from 'naive-ui';

declare global {
  interface keyable {
    [key: string]: any;
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

  interface IState {
    token?: string;
    title: string;
    error?: string;
    user?: IUser;
    nav: {
      options: Array<MenuOption>;
      key: string;
    };
  }

  interface ISettings {
    registration_open: boolean;
  }

  interface IGenPlace {
    id: number;

    name_be: string;
    name_ru: string;

    coordinates: string;
    place_type: string;
    place_ru: string;
    place_vars_ru: string | null;
    place_be: string;
    place_vars_be: string | null;
    cur_name_be: string;
    lon: number;
    lat: number;
    ui: number;
    region_be: string;
    district_be: string;
    ds_cap: string | null;
    ss2011: string | null;
    cap2011: string | null;
    soato2011: string | null;
    pop2009: number | null;
    pop1999: number | null;
    county: string;
    gubernia: string;
    rp_code: string | null;
    type1981: string;
    ds1981: string;
    ss1981_ru: string | null;
    adm1980: string | null;
    ds1953: string; reg1953: string;
    code_ceased: number;
  }
}
