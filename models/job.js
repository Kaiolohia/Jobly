"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
          `SELECT title
           FROM jobs
           WHERE title=$1`,
        [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
        [
            title,
            salary,
            equity,
            company_handle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll(filter = {}) {
    let queryFilters = []
    if ("title" in filter) {queryFilters.push(`LOWER(title) LIKE LOWER('%${filter["title"].replace(/;|--/g, "")}%')`)}
    if ("minSalary" in filter) {queryFilters.push(`salary >= ${filter["minEmployees"].replace(/;|--/g, "")}`)}
    if ("hasEquity" in filter) {queryFilters.push(`equity IS ${filter["hasEquity"] ? "NOT" : ""} NULL`)}
    const jobRes = await db.query(
      `SELECT 
        title,
        salary,
        equity,
        company_handle
       FROM jobs
       ${queryFilters.length ? "WHERE" : ""} ${queryFilters.join(" AND ")}
       ORDER BY title`);
    
    return jobRes.rows;
  }

  /** Given a job title, return data about job.
   *
   * Returns { title salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(title) {
    const jobRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE title = $1`,
        [title]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate( data, {} );
    const titleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE job
                      SET ${setCols}
                      WHERE title = ${titleVarIdx} 
                      RETURNING title, 
                                salary,
                                equity,
                                company_handle`;
    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(title) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`,
        [title]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${title}`);
  }
}


module.exports = Job;
