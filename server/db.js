/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { Worker } from 'worker_threads';
import bcrypt from 'bcrypt';
import passGen from 'generate-password';
import dotenv from 'dotenv';
import pg from 'pg';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

dotenv.config();

const saltRounds = 8;
const passOptions = {
  length: 18,
  numbers: true,
  uppercase: false,
  excludeSimilarCharacters: true,
  strict: true,
  symbols: false,
};

const { Pool } = pg;
const pool = new Pool();

// const DATE_OID = 1082;
// const parseDate = (value) => new Date(value);
// pg.types.setTypeParser(DATE_OID, parseDate);

const { types } = pg;
types.setTypeParser(types.builtins.DATE, (val) => val);

const databaseQuery = `SELECT table_name FROM information_schema.columns
 WHERE table_schema = 'public' group by table_name`;

const databaseScheme = {

  users: `
    id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username  TEXT NOT NULL,
    firstname TEXT NOT NULL,
    lastname  TEXT NOT NULL,
    email     TEXT NOT NULL,
    sex       INTEGER NOT NULL,
    privs     INTEGER NOT NULL,
    note      TEXT,
    prefs     JSON,
    _passhash TEXT NOT NULL,
    activated BOOLEAN NOT NULL DEFAULT FALSE,
    requested TIMESTAMP WITH TIME ZONE`,

};

let tablesResult;
try {
  tablesResult = await pool.query(databaseQuery);
} catch (error) {
  console.error(error);
  pool.end();
  process.exit(1);
}

const tables = tablesResult.rows.map((x) => x.table_name);

const prepareTable = async (args) => {
  const tableName = args[0];
  if (!tables.includes(tableName)) {
    console.log(`init table '${tableName}'`);
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${args[1]})`);
    } catch (createError) {
      console.error(createError);
      console.error(`Issue with table '${tableName}'!`);
      throw createError;
    }
    await pool.query(`ALTER TABLE ${tableName} OWNER TO ${process.env.PGUSER}`);
  }
};

if (tables.length !== Object.keys(databaseScheme).length) {
  console.log('initializing database: started');
  try {
    await pool.query('BEGIN');
    try {
      /* eslint-disable-next-line no-restricted-syntax */
      for (const table of Object.entries(databaseScheme)) {
        /* eslint-disable-next-line no-await-in-loop */
        await await prepareTable(table);
      }
      await pool.query('COMMIT');
      tablesResult = await pool.query(databaseQuery);
      console.log('initializing database: done');
    } catch (error) {
      console.log(error);
      console.log('Rolling back...');
      await pool.query('ROLLBACK');
    }
  } catch (error) {
    console.log('initializing database: error\n', error);
  }
}

export default {
  async changeActivationStatus(user, userId, status) {
    console.log('activation request:', userId, 'by', user.id);
    let data = {};
    if (userId && user.privs === 1) {
      try {
        const sql = 'UPDATE users SET activated = $2 WHERE id = $1 RETURNING id';
        const result = await pool.query(sql, [userId, status]);
        data = result?.rows?.[0];
      } catch (err) {
        console.error(err);
      }
    }
    return data;
  },
  async elevateUser(user, userId) {
    console.log('privileges elevation request for', userId, 'by', user.id, user.privs === 1);
    let data = {};
    if (userId && user.privs === 1) {
      try {
        const sql = 'UPDATE users SET privs = 1 WHERE id = $1 RETURNING id';
        const result = await pool.query(sql, [userId]);
        data = result?.rows?.[0];
      } catch (err) {
        console.error(err);
      }
    }
    return data;
  },
  async resetPassword(currentUser, id) {
    if (currentUser.privs === 1) {
      try {
        const pwd = passGen.generate(passOptions);
        const hash = await bcrypt.hash(pwd, saltRounds);
        await pool.query('UPDATE users SET _passhash = $2 WHERE id = $1', [id, hash]);
        return { message: pwd, id };
      } catch (error) {
        console.error(error);
      }
    }
    return { error: 'Operation is allowed only for administrators' };
  },
  async updateUser(currentUser, props) {
    let data = {};
    const userId = Number(props?.id);
    if (userId && (currentUser.privs < 3 || currentUser.id === userId)) {
      const sql = 'UPDATE users SET username = LOWER($2), firstname = INITCAP($3), lastname = INITCAP($4), email = LOWER($5) WHERE id = $1 RETURNING id';
      const values = [userId, props.username, props.firstname, props.lastname, props.email];
      try {
        const usersData = await pool.query('SELECT * FROM users where id <> $1', [userId]);
        if (usersData.rows.filter((x) => x.email === props.email).length) {
          data = { error: 'email not unique' };
        } else if (usersData.rows.filter((x) => x.username === props.username).length) {
          console.log('username');
          data = { error: 'username not unique' };
        } else {
          const result = await pool.query(sql, values);
          data = result?.rows?.[0];
        }
      } catch (err) {
        console.error(err);
      }
    }
    return data;
  },
  async getUsers(user, id) {
    let sql = `SELECT id, username, firstname, lastname, email, privs, activated ${user.privs === 1 ? ', requested, note' : ''} from users`;
    // console.log(sql);
    let data = [];
    const values = [];

    if (id) {
      sql += ' WHERE id = $1';
      values.push(id);
    } else if (user.privs === 1) {
      sql += ' ORDER BY requested DESC';
    }

    try {
      const result = await pool.query(sql, values);
      data = result?.rows;
    } catch (err) {
      console.error(err);
    }

    return data;
  },
  async getUserDataByID(id) {
    const sql = 'UPDATE users SET requested = NOW() WHERE id = $1'; // to log activity
    await pool.query(sql, [id]);
    const result = await pool.query('SELECT * from users WHERE id = $1 AND activated = TRUE', [id]);
    return result?.rows?.[0];
  },
  async getUserData(email, pwd) {
    if (!email) { return { error: 'email' }; }
    if (!pwd) { return { error: 'password' }; }

    // console.log("email/pwd", email, pwd);
    const res = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $1', [email]);
    if (res.rows.length) {
      const data = res.rows[0];
      // console.log("userdata", data);
      // console.log("pass/hash", pwd, data._passhash);
      if (data.activated) {
        const result = await bcrypt.compare(pwd, data._passhash);
        Reflect.deleteProperty(data, '_passhash');
        // console.log("pass/hash result", result);
        return result ? data : { error: 'password' };
      }
      return { error: 'user status' };
    }
    return { error: 'email' };
  },
  async createUser(formData, status = false) {
    // console.log('create user', formData);
    const data = formData;
    let isActivated = status;
    let setup = false;
    // const settingsResult = await pool.query('SELECT * FROM settings');
    // const settings = settingsResult.rows.shift();

    // if (!settings?.registration_open) {
    //   return { error: 'registration is closed' };
    // }

    const usersData = await pool.query('SELECT * FROM users');
    if (usersData.rows.length) {
      if (usersData.rows.filter((x) => x.email === data.email).length) {
        return { error: 'email not unique' };
      }
      if (usersData.rows.filter((x) => x.username === data.username).length) {
        return { error: 'username not unique' };
      }
    } else {
      // if users table is empty it means it is first run and we have to create admin user
      // make later regular set up UI
      data.privs = 1;
      isActivated = true;
      setup = true;
      console.log('create admin');
    }
    const note = formData?.note || '';

    // if (settings?.registration_code?.length && note.includes(settings.registration_code)) {
    //   console.log('activated via pass code');
    //   isActivated = true;
    // }

    const pwd = passGen.generate(passOptions);
    // console.log('make hash');
    const hash = await bcrypt.hash(pwd, saltRounds);
    // console.log('ready');
    // console.log(pwd, hash);
    const result = await pool.query('INSERT INTO users (requested, username, firstname, lastname, email, sex, privs, _passhash, activated, note) VALUES(NOW(), LOWER($1), INITCAP($2), INITCAP($3), LOWER($4), $5, $6, $7, $8, $9) RETURNING id', [data.username, data.firstname, data.lastname, data.email, data.sex, data.privs, hash, isActivated, note]);
    if (result.rows.length === 1) {
      return { message: pwd, status: isActivated, setup };
    }
    return { error: 'user' };
  },

  async release() {
    return pool.end();
  }
};
