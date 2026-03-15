import express from "express";
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {departments, subjects} from "../db/schema";
import { db } from "../db";

const subjectsRouter = express.Router();

subjectsRouter.get("/", async (req, res) =>{
    try {
        const {search, department, page = 1, limit = 10} = req.query;
        const currPage = Math.max(1, Number(page) || 1);
        const limitPerPage = Math.max(1, Number(limit) || 10);

        const offSet = (currPage - 1) * limitPerPage;
        const filterConditions = [];

        if (search){
            filterConditions.push((
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            ))
        }
        if(department){
            filterConditions.push(ilike(departments.name   , `%${department}%`))
        }

    //     Combine all filters
        const whereClause = filterConditions.length
        > 0 ? and(...filterConditions) : undefined;

        const countResult = await db.select({count:sql<number>`count(*)`}).from(subjects).leftJoin(departments,eq(subjects.departmentId,departments.id)).where(whereClause);

        const totalCount = Number(countResult[0]?.count) || 0;
        const subjectList = await db.select({
            ...getTableColumns(subjects), department:{...getTableColumns(departments)}
        }).from(subjects).leftJoin(departments,eq(subjects.departmentId,departments.id)).where(whereClause).orderBy(desc(subjects.createdAt)).limit(limitPerPage).offset(offSet);

        res.status(200).json({data:subjectList,
            pagination:{
            page:currPage,
            limit:limitPerPage,
                total:totalCount,
            totalPages:Math.ceil(totalCount/limitPerPage),
            }
        });

    }catch (e) {
        console.log(`GET subjects error ${e}`)
        res.status(500).json({error:"Failed to fetch subjects"});
    }
});

export default subjectsRouter;