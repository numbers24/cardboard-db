const sqlite3 = require('sqlite3').verbose();

/**
 * gets the sqlLite connection object
 * @returns
 */
const getConnection = () => { 
        let connection = new sqlite3.Database('./src/resources/database.sqlite', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        else {
            console.log('Connected to the database.');
        }
    });
    return connection
};

/**
 * Object Relational Mapping
 * @param {*} table 
 * @param  {...any} cols 
 * @returns
 */
const ORM = (table, ...cols) => ({
    /**
     * calls SQL to create table
     */
    create: () => {
        conn = getConnection();
        let colList = cols.map((col) => `${col}`).join(' TEXT, ') + ' TEXT';
        let sql = `CREATE TABLE IF NOT EXISTS ${table}(${colList})`;
        console.log(sql);
        conn.run(sql);
        conn.close();
    },
    /**
     * inserts a new row into the table
     * @param  {...any} values an ordered set of values which represent the columns of table
     */
    insert: (...values) => {
        conn = getConnection();
        let placeholders = '(' + values.map((v) => '?').join(',') + ')';
        let colList = cols.map((col) => `${col}`).join(', ');
        let sql = `INSERT INTO ${table}(${colList}) VALUES ` + placeholders;
        console.log(sql, values);
        conn.run(sql, values, function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log(`Rows inserted ${this.changes}`);
          });
        conn.close();
    },
    /**
     * logs all items within the table
     */
    all: () => {
        conn = getConnection();
        let sql = `SELECT * FROM ${table}`;
        console.log(sql);
        conn.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
              }
            console.log(rows);
        });
        conn.close();
    },
    /**
     * queries results based off passed in column/value pair
     * @param {*} col column name
     * @param {*} value column value
     * @returns 
     */
    where: (col, value) => ({
        /**
         * processes results together in a set
         * @param {*} proccess function passed in above the abstract level
         */
        all: (proccess) => { 
            conn = getConnection();
            colList = cols.map((col) => `${col} ${col}`).join(`, `);
            sql = `SELECT ${colList} FROM ${table} WHERE ${col} = ?`,
            console.log(sql);
            conn.all(sql, [value], (err, rows) => {
                if (err) {
                    throw err;
                  }
                console.log(rows);
                proccess(rows);
            });
            conn.close();
        },
        /**
         * processes results sequentially
         * @param {*} proccess function passed in above the abstract level
         */
        each: (proccess) => {
            conn = getConnection();
            colList = cols.map((col) => `${col} ${col}`).join(`, `);
            sql = `SELECT ${colList} FROM ${table} WHERE ${col} = ?`,
            console.log(sql);
            conn.each(sql, [value], (err, rows) => {
                if (err) {
                    throw err;
                  }
                console.log(rows);
                proccess(rows);
            });
            conn.close();
        },
        /**
         * process results sequentially with an additional where clause
         * @param {*} col2 second column name
         * @param {*} value2 second columns value
         * @param {*} proccess function passed in above the abstract level
         */
        and: (col2, value2, proccess) => {
            conn = getConnection();
            colList = cols.map((col) => `${col} ${col}`).join(`, `);
            sql = `SELECT ${colList} FROM ${table} WHERE ${col} = ? AND ${col2} = ?`,
            console.log(sql);
            conn.each(sql, [value, value2], (err, rows) => {
                if (err) {
                    throw err;
                  }
                console.log(rows);
                proccess(rows);
            });
            conn.close();
        }
    }),
    /**
     * deletes all rows in the table from passed in row values
     * @param  {...any} values represent a value for each column in the table
     */
    delete: (...values) => {
        conn = getConnection();
        let colList = cols.map((col) => `${col} = ?`).join(` AND `) ;
        let sql = `DELETE FROM ${table} WHERE ${colList}`
        console.log(sql);
        console.log(values)
        conn.run(sql, values, function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log(`Row(s) deleted ${this.changes}`);
          });
        conn.close();
    }
});

/**
 * exports and defines tables in the database
 */
module.exports = {
    collections: ORM('collections', 'user', 'name', 'type'),
    cards: ORM('cards', 'id', 'picture', 'user', 'collection_name')
}
