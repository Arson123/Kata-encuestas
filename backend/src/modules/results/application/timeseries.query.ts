import { AppDataSource } from "../../../infrastructure/orm/data-source.js";

export default class TimeseriesQuery {
  async exec(surveyId: string, granularity: "minute" | "hour" = "hour") {
    const field =
      granularity === "minute" ? "YYYY-MM-DD HH24:MI" : "YYYY-MM-DD HH24";
    const rows = await AppDataSource.query(
      `select to_char("createdAt", '${field}') as bucket, count(*) as c
       from "response"
       where "surveyId" = $1
       group by 1 order by 1`,
      [surveyId]
    ).catch(async () => {
      const resp = await AppDataSource.query(
        `select date_trunc($1, "createdAt") as bucket, count(*) as c
         from "response"
         where "surveyId" = $2
         group by 1 order by 1`,
        [granularity, surveyId]
      );
      return resp.map((r: any) => ({ bucket: r.bucket, c: r.c }));
    });
    return rows;
  }
}
