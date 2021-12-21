/*
 * @Date: 2021-12-20 10:56:43
 * @LastEditors: lzj
 * @LastEditTime: 2021-12-21 19:52:09
 * @FilePath: \farmer-cli\src\mysql\connection.ts
 */
import {ConnectionConfig,createPool, Pool,MysqlError} from "mysql-await";

let pool:any = null;

const getConnection = async (config:any) => {
  if(!!pool){
    pool = createPool(config);

    pool.on(`acquire`, (connection:any) => {
      console.log(`Connection %d acquired`, connection.threadId);
    });

    pool.on(`connection`, (connection:any) => {
      console.log(`Connection %d connected`, connection.threadId);
    });

    pool.on(`enqueue`, () => {
      console.log(`Waiting for available connection slot`);
    });

    pool.on(`release`, function (connection:any) {
      console.log(`Connection %d released`, connection.threadId);
    });
  }

 return await pool.awaitGetConnection();
}


const mockDataInsert = async () =>{
 const connection:any = await pool.awaitGetConnection();
  connection.on(`error`, (err:any) => {
    console.error(`Connection error ${err.code}`);
  });

  let result = await connection.awaitQuery(`SELECT * FROM people WHERE lastName = ?`, [`Smith`]);
  console.log(result);
}

