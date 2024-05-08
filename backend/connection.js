const OracleDB = require("oracledb");
require("dotenv").config();

const connection = async () => {
  try {
    const connectionData = await OracleDB.getConnection({
      user: "hr",
      password: "123",
      connectString: process.env.CONNECTION_STRING,
    });
    console.log("Connected to oracle database");
    return connectionData;
  } catch (error) {
    console.log(error);
  }
};

const runQuery = async (query, params) => {
  const conn = await connection();
  const data = await conn.execute(query, params, {
    outFormat: OracleDB.OUT_FORMAT_OBJECT,
  });
  conn.commit();
  await conn.close();
  return data.rows;
};

module.exports = { connection, runQuery };
