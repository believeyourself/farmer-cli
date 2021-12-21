/*
 * @Date: 2021-12-01 10:14:35
 * @LastEditors: lzj
 * @LastEditTime: 2021-12-21 19:42:30
 * @FilePath: \farmer-cli\src\type.d.ts
 */
type YArgs = {
  _: string[],
  [key:string]:any
}
declare module "mysql-await";